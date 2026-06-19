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

# --- Expo account guardrails -------------------------------------------------
# Every cloud build must run under the right Expo account. Two things decide
# that: the `owner` field in app.config.ts (which account owns the project) and
# the EXPO_TOKEN that authenticates a user with access to it. The helpers below
# load that token, surface the configured owner, and confirm you're logged in
# BEFORE a (slow, billable) EAS build starts.

# Placeholder values shipped with the template. When app.config.ts still holds
# these, the project has not been wired to a real Expo account yet.
$script:ExpoOwnerPlaceholder     = 'your-expo-account'
$script:ExpoProjectIdPlaceholder = '00000000-0000-0000-0000-000000000000'

# Load KEY=VALUE pairs from a local .env file into the process environment so
# child processes (eas-cli) inherit them. An already-set environment value
# always wins, so an explicitly-exported EXPO_TOKEN is never clobbered. Blank
# lines and '#' comments are ignored; surrounding quotes are stripped.
function Import-DotEnv {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string] $Path)

    if (-not (Test-Path $Path)) { return }
    foreach ($line in Get-Content $Path) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
        $eq = $trimmed.IndexOf('=')
        if ($eq -lt 1) { continue }
        $key = $trimmed.Substring(0, $eq).Trim()
        $val = $trimmed.Substring($eq + 1).Trim()
        if ($val.Length -ge 2 -and
            (($val.StartsWith('"') -and $val.EndsWith('"')) -or
             ($val.StartsWith("'") -and $val.EndsWith("'")))) {
            $val = $val.Substring(1, $val.Length - 2)
        }
        if (-not [string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($key))) { continue }
        Set-Item -Path "Env:$key" -Value $val
    }
}

# Read the `owner` field from app.config.ts -- the single source of truth for
# which Expo account/org this project builds under. Regex-based so it stays fast
# and needs no Node evaluation; the field is a plain string literal.
function Get-ExpoOwner {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string] $RepoRoot)

    $configPath = Join-Path $RepoRoot 'app.config.ts'
    if (-not (Test-Path $configPath)) {
        throw "app.config.ts not found at $configPath."
    }
    $content = Get-Content $configPath -Raw
    $match = [regex]::Match($content, "owner:\s*['""]([^'""]+)['""]")
    if (-not $match.Success) {
        throw "No owner field found in app.config.ts. Add owner: '<your-expo-account>' so EAS builds under the right account."
    }
    return $match.Groups[1].Value
}

# Verify the project is set up to build under the correct Expo account, and
# report what it found. Loads .env (for EXPO_TOKEN), checks the configured owner
# is not still the template placeholder, and confirms an authenticated EAS
# session. With -RequireLogin, a missing login is fatal (use for real builds);
# without it, missing login is a warning (use for dry runs / informational use).
function Assert-ExpoAccount {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [switch] $RequireLogin
    )

    Assert-Tooling

    # Per-repo auth: pin EAS to this project's account regardless of global login.
    Import-DotEnv -Path (Join-Path $RepoRoot '.env')

    Write-Banner 'Expo account check'

    $owner = Get-ExpoOwner -RepoRoot $RepoRoot
    if ($owner -eq $script:ExpoOwnerPlaceholder) {
        Write-Host "  WARNING: app.config.ts still has the placeholder owner '$owner'." -ForegroundColor Yellow
        Write-Host "           Replace it with your Expo account/org slug before building," -ForegroundColor Yellow
        Write-Host "           or EAS will not build under the account you expect." -ForegroundColor Yellow
    }
    else {
        Write-Host "  Expo account (owner): $owner" -ForegroundColor Gray
    }

    # The placeholder projectId means `eas init` has not been run yet.
    $configContent = Get-Content (Join-Path $RepoRoot 'app.config.ts') -Raw
    if ($configContent -match [regex]::Escape($script:ExpoProjectIdPlaceholder)) {
        Write-Host "  WARNING: extra.eas.projectId is still the placeholder. Run 'npx eas-cli init'" -ForegroundColor Yellow
        Write-Host "           to link this project before a cloud build." -ForegroundColor Yellow
    }

    if ([string]::IsNullOrEmpty($env:EXPO_TOKEN)) {
        Write-Host "  EXPO_TOKEN not set - EAS will use your global 'eas login' session." -ForegroundColor Yellow
        Write-Host "           Copy .env.example to .env and add a token to pin this repo to its account." -ForegroundColor Yellow
    }
    else {
        $maskLen = [Math]::Min(6, $env:EXPO_TOKEN.Length)
        Write-Host "  EXPO_TOKEN loaded from .env ($($env:EXPO_TOKEN.Substring(0, $maskLen))...)." -ForegroundColor Gray
    }

    # Confirm we are authenticated and report who. EAS itself enforces that the
    # logged-in user may publish under `owner`; this is the early, readable check.
    $whoami = (& npx 'eas-cli' whoami 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($whoami)) {
        $msg = "Not logged in to EAS. Run 'npx eas-cli login' or set EXPO_TOKEN in .env."
        if ($RequireLogin) { throw $msg }
        Write-Host "  $msg" -ForegroundColor Yellow
        return
    }
    Write-Host "  Logged in to EAS as: $whoami" -ForegroundColor Green
}
