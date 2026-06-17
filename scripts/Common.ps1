# Common.ps1 — shared helpers for the dev build/run launch scripts.
#
# Dot-source it from each launch script:
#   . (Join-Path $PSScriptRoot 'Common.ps1')
#
# Single source of truth for the things every launch script needs: a
# tooling check, a consistent banner, and a repo-root-anchored Expo runner.
# Windows PowerShell 5.1 compatible — no PS7-only syntax.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Fail early with an actionable message when the Node toolchain is missing,
# rather than letting a downstream command emit a cryptic error.
function Assert-Tooling {
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
        throw 'npx was not found on PATH. Install Node.js (it bundles npm and npx), then reopen your terminal.'
    }
}

# A single, recognisable line so the user can see exactly which command a
# script is about to run.
function Write-Banner {
    param([Parameter(Mandatory = $true)][string] $Message)

    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

# Run an `expo` subcommand from the repo root so it always resolves the
# project regardless of where the script was launched from. `$RepoRoot` is
# passed in by the caller (which knows its own location reliably) so this
# helper never has to guess it.
function Invoke-Expo {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [Parameter(Mandatory = $true)][string[]] $ExpoArgs
    )

    Assert-Tooling
    Push-Location $RepoRoot
    try {
        Write-Banner ('npx expo ' + ($ExpoArgs -join ' '))
        & npx 'expo' @ExpoArgs
        # Native exit code is the source of truth; never rely on $? here.
        if ($LASTEXITCODE -ne 0) {
            throw "expo exited with code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-Eas {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [Parameter(Mandatory = $true)][string[]] $EasArgs
    )

    Assert-Tooling
    Push-Location $RepoRoot
    try {
        Write-Banner ('npx eas-cli ' + ($EasArgs -join ' '))
        & npx 'eas-cli' @EasArgs
        if ($LASTEXITCODE -ne 0) {
            throw "eas-cli exited with code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}
