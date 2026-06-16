# BuildAndRunIOSDevelopment.ps1
#
# Builds the native iOS development client and runs it on a simulator or a
# connected device, via `expo run:ios`. iOS native builds require macOS and
# Xcode; on other platforms expo reports the unsupported-platform error
# itself.
#
# Usage:
#   ./BuildAndRunIOSDevelopment.ps1
#   ./BuildAndRunIOSDevelopment.ps1 -Device "iPhone 15 Pro"
#   ./BuildAndRunIOSDevelopment.ps1 -Configuration Release
#
# Parameters:
#   -Device         Name or UDID of the target simulator/device. Omit to
#                   let expo pick the default simulator.
#   -Configuration  Xcode build configuration. Debug (default) or Release.

[CmdletBinding()]
param(
    [string] $Device,
    [ValidateSet('Debug', 'Release')]
    [string] $Configuration = 'Debug'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# scripts/ sits at the repo root, so the root is this script's parent.
$RepoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'Common.ps1')

$expoArgs = @('run:ios', '--configuration', $Configuration)
if ($Device) {
    $expoArgs += @('--device', $Device)
}

Invoke-Expo -RepoRoot $RepoRoot -ExpoArgs $expoArgs
