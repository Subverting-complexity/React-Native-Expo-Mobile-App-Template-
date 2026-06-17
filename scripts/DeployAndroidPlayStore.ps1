# DeployAndroidPlayStore.ps1
#
# Builds the Android production binary via EAS and submits it to the
# Google Play Store. The build runs on Expo's cloud build service;
# submission uses the credentials configured in your Expo/Google account.
#
# Usage:
#   ./DeployAndroidPlayStore.ps1            # build + submit to Play Store
#   ./DeployAndroidPlayStore.ps1 -DryRun   # validate config, skip actual build
#   ./DeployAndroidPlayStore.ps1 -SkipSubmit  # build only, don't submit
#   ./DeployAndroidPlayStore.ps1 -Message "v1.2 hotfix"  # EAS build message

[CmdletBinding()]
param(
    [switch] $DryRun,
    [switch] $SkipSubmit,
    [string] $Message
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'Common.ps1')

# -- Build --
$buildArgs = @('build', '--platform', 'android', '--profile', 'production', '--non-interactive')
if ($Message) {
    $buildArgs += @('--message', $Message)
}

if ($DryRun) {
    Write-Banner 'DeployAndroidPlayStore (dry run)'
    Write-Host "  Would run: npx eas-cli $($buildArgs -join ' ')"
    Write-Host "  Then submit to Play Store via: npx eas-cli submit --platform android --profile production"
    Write-Host ''
    Write-Host '  (dry run -- nothing executed)' -ForegroundColor Yellow
    return
}

Write-Banner 'DeployAndroidPlayStore -- Build'
Invoke-Eas -RepoRoot $RepoRoot -EasArgs $buildArgs

# -- Submit --
if ($SkipSubmit) {
    Write-Host ''
    Write-Host '  Build complete. Submission skipped (-SkipSubmit).' -ForegroundColor Yellow
    return
}

Write-Banner 'DeployAndroidPlayStore -- Submit to Play Store'
$submitArgs = @('submit', '--platform', 'android', '--profile', 'production', '--non-interactive', '--latest')
Invoke-Eas -RepoRoot $RepoRoot -EasArgs $submitArgs

Write-Host ''
Write-Host '  Android build submitted to Play Store.' -ForegroundColor Green
