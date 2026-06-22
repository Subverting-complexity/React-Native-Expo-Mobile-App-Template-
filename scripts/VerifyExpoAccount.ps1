# VerifyExpoAccount.ps1
#
# Standalone "am I building under the right Expo account?" check. Loads .env,
# reports the owner configured in app.config.ts, whether EXPO_TOKEN is set, and
# which EAS account you're currently authenticated as.
#
# Run this any time before a build, or wire it into a pipeline. The deploy
# scripts (DeployiOSTestFlight.ps1 / DeployAndroidPlayStore.ps1) run the same
# check automatically.
#
# Usage:
#   ./VerifyExpoAccount.ps1            # report; fail if not logged in to EAS
#   ./VerifyExpoAccount.ps1 -Soft      # report only; never fail on missing login

[CmdletBinding()]
param(
    [switch] $Soft
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-ExpoAccount -RepoRoot $RepoRoot -RequireLogin:(-not $Soft)

Write-Host ''
Write-Host '  Expo account check complete.' -ForegroundColor Green
