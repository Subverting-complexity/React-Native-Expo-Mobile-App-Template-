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
# Before the branch is cut, the release version moves on by one and the bump
# is committed to main and pushed. Running both deploy scripts back to back
# still bumps once: the tool stops when the last commit is already its own.
# -Level chooses patch/minor/major (default minor). -AllowDirty skips the
# bump, because a bump refuses to commit from a dirty tree.
#
# Usage:
#   ./DeployAndroidPlayStore.ps1              # build + submit to Play Store
#   ./DeployAndroidPlayStore.ps1 -DryRun     # validate config, skip actual build
#   ./DeployAndroidPlayStore.ps1 -SkipSubmit # build only, don't submit
#   ./DeployAndroidPlayStore.ps1 -AllowDirty # deploy from a dirty tree (tag says so)
#   ./DeployAndroidPlayStore.ps1 -Level major   # bump 1.4.0 -> 2.0.0 instead of 1.5.0
#   ./DeployAndroidPlayStore.ps1 -Message "v1.2 hotfix"  # EAS build message

[CmdletBinding()]
param(
    [switch] $DryRun,
    [switch] $SkipSubmit,
    [switch] $AllowDirty,
    [ValidateSet('patch', 'minor', 'major')]
    [string] $Level = 'minor',
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
    Write-Host "  Would bump the release version ($Level) and commit it to main"
    Write-Host "  Would run: npx eas-cli $($buildArgs -join ' ')"
    Write-Host "  Then submit to Play Store via: npx eas-cli submit --platform android --profile production"
    Write-Host ''
    Write-Host '  (dry run -- nothing executed)' -ForegroundColor Yellow
    return
}

# -- Version bump: move the release version on before anything is cut --
# Skipped with -AllowDirty: a bump creates a commit on main, and it refuses
# to do that from a dirty tree rather than sweeping unrelated edits into it.
if ($AllowDirty) {
    Write-Banner 'DeployAndroidPlayStore -- Version bump (skipped)'
    Write-Host '  -AllowDirty was passed, so the version is left as it is.' -ForegroundColor Yellow
}
else {
    Write-Banner 'DeployAndroidPlayStore -- Version bump'
    $bumpCode = Invoke-VersionBumpTool -RepoRoot $RepoRoot -ToolArgs @('bump', '--level', $Level)
    if ($bumpCode -ne 0) {
        Write-Host ''
        Write-Host '  Deploy stopped before the build. See the message above.' -ForegroundColor Red
        exit 1
    }
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
