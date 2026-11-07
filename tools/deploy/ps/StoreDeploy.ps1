# StoreDeploy.ps1 -- the store deploy flow that DeployiOSTestFlight.ps1 and
# DeployAndroidPlayStore.ps1 share.
#
# Dot-source it after tools/shared/ps/Common.ps1:
#   . (Join-Path $PSScriptRoot 'StoreDeploy.ps1')
#
# The flow, in order: the Expo account check, the version bump, the release
# branch, the EAS build, the store submit, and the outcome tag. The outcome
# tag is written whatever happens after the branch is cut. See
# docs/release-branches.md and docs/releasing.md.
# Windows PowerShell 5.1 compatible -- no PS7-only syntax.

function Invoke-StoreDeploy {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [Parameter(Mandatory = $true)][ValidateSet('ios', 'android')][string] $Platform,
        # The calling script's name, used in every banner.
        [Parameter(Mandatory = $true)][string] $ScriptName,
        # The platform and store as a reader sees them, such as 'iOS' and 'TestFlight'.
        [Parameter(Mandatory = $true)][string] $PlatformLabel,
        [Parameter(Mandatory = $true)][string] $StoreName,
        [switch] $DryRun,
        [switch] $SkipSubmit,
        [switch] $AllowDirty,
        [ValidateSet('patch', 'minor', 'major')]
        [string] $Level = 'minor',
        [string] $Message
    )

    # Confirm we'll build under the correct Expo account (owner + EXPO_TOKEN) and
    # load .env so eas-cli inherits the token. A dry run reports but won't hard-fail
    # on a missing login.
    Assert-ExpoAccount -RepoRoot $RepoRoot -RequireLogin:(-not $DryRun)

    # -- Build --
    $buildArgs = @('build', '--platform', $Platform, '--profile', 'production', '--non-interactive')
    if ($Message) {
        $buildArgs += @('--message', $Message)
    }

    if ($DryRun) {
        Write-Banner "$ScriptName (dry run)"
        Write-Host "  Would bump the release version ($Level) and commit it to main"
        Write-Host "  Would run: npx eas-cli $($buildArgs -join ' ')"
        Write-Host "  Then submit to $StoreName via: npx eas-cli submit --platform $Platform --profile production"
        Write-Host ''
        Write-Host '  (dry run -- nothing executed)' -ForegroundColor Yellow
        return
    }

    # -- Version bump: move the release version on before anything is cut --
    # Skipped with -AllowDirty: a bump creates a commit on main, and it refuses
    # to do that from a dirty tree rather than sweeping unrelated edits into it.
    if ($AllowDirty) {
        Write-Banner "$ScriptName -- Version bump (skipped)"
        Write-Host '  -AllowDirty was passed, so the version is left as it is.' -ForegroundColor Yellow
    }
    else {
        Write-Banner "$ScriptName -- Version bump"
        $bumpCode = Invoke-VersionBumpTool -RepoRoot $RepoRoot -ToolArgs @('bump', '--level', $Level)
        if ($bumpCode -ne 0) {
            Write-Host ''
            Write-Host '  Deploy stopped before the build. See the message above.' -ForegroundColor Red
            exit 1
        }
    }

    # -- Release record: cut the branch before the build --
    Write-Banner "$ScriptName -- Release record"
    $startArgs = @('start', '--platform', $Platform, '--profile', 'production')
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
        Write-Banner "$ScriptName -- Build"
        Invoke-Eas -RepoRoot $RepoRoot -EasArgs $buildArgs

        if ($SkipSubmit) {
            Write-Host ''
            Write-Host '  Build complete. Submission skipped (-SkipSubmit).' -ForegroundColor Yellow
        }
        else {
            Write-Banner "$ScriptName -- Submit to $StoreName"
            $submitArgs = @('submit', '--platform', $Platform, '--profile', 'production', '--non-interactive', '--latest')
            Invoke-Eas -RepoRoot $RepoRoot -EasArgs $submitArgs
            $submitted = 'yes'
        }

        $outcome = 'success'
        $exitCode = 0
    }
    catch {
        # Invoke-Eas puts the eas-cli exit code on the exception; other failures keep 1.
        if ($_.Exception.Data.Contains('ExitCode')) {
            $exitCode = $_.Exception.Data['ExitCode']
        }
        throw
    }
    finally {
        $stopwatch.Stop()
        $duration = $stopwatch.Elapsed.ToString('hh\:mm\:ss')
        Write-Banner "$ScriptName -- Release record"
        $finishArgs = @(
            'finish', '--platform', $Platform, '--outcome', $outcome,
            '--duration', $duration, '--exit-code', "$exitCode", '--submitted', $submitted
        )
        [void] (Invoke-ReleaseBranchTool -RepoRoot $RepoRoot -ToolArgs $finishArgs)
    }

    Write-Host ''
    if ($SkipSubmit) {
        Write-Host "  $PlatformLabel build finished (not submitted)." -ForegroundColor Green
    }
    else {
        Write-Host "  $PlatformLabel build submitted to $StoreName." -ForegroundColor Green
    }
}
