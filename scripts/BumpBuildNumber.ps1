# BumpBuildNumber.ps1
#
# Increments ios.buildNumber and android.versionCode in app.config.ts
# so the local seed stays in sync after a production release. EAS
# auto-increments the remote counter on each build (appVersionSource:
# "remote"), but keeping the local values current avoids confusion in
# local/preview builds and makes the commit history show the bump.
#
# Usage:
#   ./BumpBuildNumber.ps1              # bump both platforms
#   ./BumpBuildNumber.ps1 -DryRun     # show what would change, don't write
#   ./BumpBuildNumber.ps1 -Version 2.0.0  # also set the semver version

[CmdletBinding()]
param(
    [switch] $DryRun,
    [string] $Version
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'Common.ps1')

$configPath = Join-Path $RepoRoot 'app.config.ts'
if (-not (Test-Path $configPath)) {
    throw "app.config.ts not found at $configPath"
}

$content = Get-Content $configPath -Raw -Encoding UTF8

# Parse current buildNumber (string in quotes)
if ($content -notmatch "buildNumber:\s*'(\d+)'") {
    throw "Could not find buildNumber in app.config.ts. Expected: buildNumber: '<number>'"
}
$oldBuildNumber = [int]$Matches[1]
$newBuildNumber = $oldBuildNumber + 1

# Parse current versionCode (bare integer)
if ($content -notmatch 'versionCode:\s*(\d+)') {
    throw 'Could not find versionCode in app.config.ts. Expected: versionCode: <number>'
}
$oldVersionCode = [int]$Matches[1]
$newVersionCode = $oldVersionCode + 1

# Parse current version if -Version was supplied (for reporting)
$versionLine = ''
if ($Version) {
    if ($content -notmatch "version:\s*'([^']+)'") {
        throw "Could not find version in app.config.ts."
    }
    $oldVersion = $Matches[1]
    $versionLine = "  version: '$oldVersion' -> '$Version'"
}

Write-Banner 'BumpBuildNumber'
Write-Host "  buildNumber: $oldBuildNumber -> $newBuildNumber"
Write-Host "  versionCode: $oldVersionCode -> $newVersionCode"
if ($versionLine) {
    Write-Host $versionLine
}

if ($DryRun) {
    Write-Host ''
    Write-Host '  (dry run -- no changes written)' -ForegroundColor Yellow
    return
}

# Apply replacements
$content = $content -replace "buildNumber:\s*'$oldBuildNumber'", "buildNumber: '$newBuildNumber'"
$content = $content -replace "versionCode:\s*$oldVersionCode", "versionCode: $newVersionCode"
if ($Version) {
    $content = $content -replace "version:\s*'[^']+'", "version: '$Version'"
}

# Write with no BOM (UTF-8), preserving LF line endings
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($configPath, $content, $utf8NoBom)

Write-Host ''
Write-Host '  app.config.ts updated.' -ForegroundColor Green
