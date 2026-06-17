# DeployiOSTestFlight.ps1
#
# Builds the iOS production binary via EAS and submits it to TestFlight.
# The build runs on Expo's cloud build service; submission uses the
# credentials configured in your Expo/Apple account.
#
# Usage:
#   ./DeployiOSTestFlight.ps1            # build + submit to TestFlight
#   ./DeployiOSTestFlight.ps1 -DryRun   # validate config, skip actual build
#   ./DeployiOSTestFlight.ps1 -SkipSubmit  # build only, don't submit
#   ./DeployiOSTestFlight.ps1 -Message "v1.2 hotfix"  # EAS build message

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
$buildArgs = @('build', '--platform', 'ios', '--profile', 'production', '--non-interactive')
if ($Message) {
    $buildArgs += @('--message', $Message)
}

if ($DryRun) {
    Write-Banner 'DeployiOSTestFlight (dry run)'
    Write-Host "  Would run: npx eas-cli $($buildArgs -join ' ')"
    Write-Host "  Then submit to TestFlight via: npx eas-cli submit --platform ios --profile production"
    Write-Host ''
    Write-Host '  (dry run -- nothing executed)' -ForegroundColor Yellow
    return
}

Write-Banner 'DeployiOSTestFlight -- Build'
Invoke-Eas -RepoRoot $RepoRoot -EasArgs $buildArgs

# -- Submit --
if ($SkipSubmit) {
    Write-Host ''
    Write-Host '  Build complete. Submission skipped (-SkipSubmit).' -ForegroundColor Yellow
    return
}

Write-Banner 'DeployiOSTestFlight -- Submit to TestFlight'
$submitArgs = @('submit', '--platform', 'ios', '--profile', 'production', '--non-interactive', '--latest')
Invoke-Eas -RepoRoot $RepoRoot -EasArgs $submitArgs

Write-Host ''
Write-Host '  iOS build submitted to TestFlight.' -ForegroundColor Green
