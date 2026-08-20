# DeployAndroidPlayStore.ps1
#
# Builds the Android production binary via EAS and submits it to the
# Google Play Store. The build runs on Expo's cloud build service;
# submission uses the credentials configured in your Expo/Google account.
#
# Every run leaves a record in git: a release/android/{stamp} branch cut
# before the build and an annotated outcome tag written after it. A dirty
# working tree refuses the deploy (the branch would name a commit that is not
# what gets built) -- see docs/release-branches.md.
#
# Usage:
#   ./DeployAndroidPlayStore.ps1              # build + submit to Play Store
#   ./DeployAndroidPlayStore.ps1 -DryRun     # validate config, skip actual build
#   ./DeployAndroidPlayStore.ps1 -SkipSubmit # build only, don't submit
#   ./DeployAndroidPlayStore.ps1 -AllowDirty # deploy from a dirty tree (tag says so)
#   ./DeployAndroidPlayStore.ps1 -Message "v1.2 hotfix"  # EAS build message

[CmdletBinding()]
param(
    [switch] $DryRun,
    [switch] $SkipSubmit,
    [switch] $AllowDirty,
    [string] $Message
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'Common.ps1')

# Confirm we'll build under the correct Expo account (owner + EXPO_TOKEN) and
# load .env so eas-cli inherits the token. A dry run reports but won't hard-fail
# on a missing login.
Assert-ExpoAccount -RepoRoot $RepoRoot -RequireLogin:(-not $DryRun)

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

# -- Release record: cut the branch before the build --
Write-Banner 'DeployAndroidPlayStore -- Release record'
$startArgs = @('start', '--platform', 'android', '--profile', 'production')
if ($AllowDirty) { $startArgs += '--allow-dirty' }
$startCode = Invoke-ReleaseBranchTool -RepoRoot $RepoRoot -ToolArgs $startArgs
if ($startCode -ne 0) {
    Write-Host ''
    Write-Host '  Deploy stopped before the build. See the message above.' -ForegroundColor Red
    exit 1
}

# -- Build + submit, with the outcome recorded whatever happens --
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$outcome = 'failed'
$submitted = 'no'
$exitCode = 1
try {
    Write-Banner 'DeployAndroidPlayStore -- Build'
    Invoke-Eas -RepoRoot $RepoRoot -EasArgs $buildArgs

    if ($SkipSubmit) {
        Write-Host ''
        Write-Host '  Build complete. Submission skipped (-SkipSubmit).' -ForegroundColor Yellow
    }
    else {
        Write-Banner 'DeployAndroidPlayStore -- Submit to Play Store'
        $submitArgs = @('submit', '--platform', 'android', '--profile', 'production', '--non-interactive', '--latest')
        Invoke-Eas -RepoRoot $RepoRoot -EasArgs $submitArgs
        $submitted = 'yes'
    }

    $outcome = 'success'
    $exitCode = 0
}
finally {
    $stopwatch.Stop()
    $duration = $stopwatch.Elapsed.ToString('hh\:mm\:ss')
    Write-Banner 'DeployAndroidPlayStore -- Release record'
    $finishArgs = @(
        'finish', '--platform', 'android', '--outcome', $outcome,
        '--duration', $duration, '--exit-code', "$exitCode", '--submitted', $submitted
    )
    [void] (Invoke-ReleaseBranchTool -RepoRoot $RepoRoot -ToolArgs $finishArgs)
}

Write-Host ''
if ($SkipSubmit) {
    Write-Host '  Android build finished (not submitted).' -ForegroundColor Green
}
else {
    Write-Host '  Android build submitted to Play Store.' -ForegroundColor Green
}
