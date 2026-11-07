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
# The flow itself is Invoke-StoreDeploy in StoreDeploy.ps1, shared with the
# other store deploy script.
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

# This script is in tools/<group>/ps, so the repo root is 3 levels up.
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
. (Join-Path $PSScriptRoot '..\..\shared\ps\Common.ps1')
. (Join-Path $PSScriptRoot 'StoreDeploy.ps1')

Invoke-StoreDeploy -RepoRoot $RepoRoot -Platform 'android' -ScriptName 'DeployAndroidPlayStore' `
    -PlatformLabel 'Android' -StoreName 'Play Store' `
    -DryRun:$DryRun -SkipSubmit:$SkipSubmit -AllowDirty:$AllowDirty -Level $Level -Message $Message
