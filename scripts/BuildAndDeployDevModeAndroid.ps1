# BuildAndDeployDevModeAndroid.ps1
#
# Builds the native Android development client, installs (deploys) it on a
# target device/emulator, and runs it via `expo run:android`. Supports
# device targeting and a dedicated logcat logging mode.
#
# Usage:
#   ./BuildAndDeployDevModeAndroid.ps1
#   ./BuildAndDeployDevModeAndroid.ps1 -Device emulator-5554
#   ./BuildAndDeployDevModeAndroid.ps1 -Device R5CT... -Logcat
#
# Parameters:
#   -Device   Serial of the target device/emulator (see `adb devices`).
#             Omit to let expo/adb pick the only attached device.
#   -Logcat   Stream native device logs with `adb logcat` instead of doing
#             a build. Use this to watch an already-deployed dev build.
#             Honours -Device for targeting.

[CmdletBinding()]
param(
    [string] $Device,
    [switch] $Logcat
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# scripts/ sits at the repo root, so the root is this script's parent.
$RepoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'Common.ps1')

if ($Logcat) {
    # Logging mode: tail device logs rather than rebuild. Requires the
    # Android platform-tools (`adb`) on PATH.
    if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
        throw 'adb was not found on PATH. Install the Android SDK platform-tools, then reopen your terminal.'
    }

    $adbArgs = @()
    if ($Device) {
        $adbArgs += @('-s', $Device)
    }
    # *:I keeps the stream readable (info level and above) for the
    # foreground app without drowning it in verbose system chatter.
    $adbArgs += @('logcat', '*:I')

    Write-Banner ('adb ' + ($adbArgs -join ' '))
    & adb @adbArgs
    if ($LASTEXITCODE -ne 0) {
        throw "adb exited with code $LASTEXITCODE."
    }
    return
}

$expoArgs = @('run:android')
if ($Device) {
    $expoArgs += @('--device', $Device)
}

Invoke-Expo -RepoRoot $RepoRoot -ExpoArgs $expoArgs
