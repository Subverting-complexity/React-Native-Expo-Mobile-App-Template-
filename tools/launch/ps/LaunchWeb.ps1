# LaunchWeb.ps1
#
# Starts the Expo dev server for the web target via `expo start --web`,
# which opens the app in a browser using the Metro web bundler.
#
# Usage:
#   ./LaunchWeb.ps1
#   ./LaunchWeb.ps1 -Port 19010
#   ./LaunchWeb.ps1 -Clear
#
# Parameters:
#   -Port   Port for the dev server. Omit to use Expo's default.
#   -Clear  Clear the Metro bundler cache before starting.

[CmdletBinding()]
param(
    [int] $Port,
    [switch] $Clear
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# This script is in tools/<group>/ps, so the repo root is 3 levels up.
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
. (Join-Path $PSScriptRoot '..\..\shared\ps\Common.ps1')

$expoArgs = @('start', '--web')
if ($Port) {
    $expoArgs += @('--port', "$Port")
}
if ($Clear) {
    $expoArgs += '--clear'
}

Invoke-Expo -RepoRoot $RepoRoot -ExpoArgs $expoArgs
