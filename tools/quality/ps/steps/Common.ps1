# Common.ps1 - shared helpers for the quality-gate steps.
#
# Dot-sourced by QualityGate.ps1 and by each step in this folder. Holds the
# things every step needs: the repo root, a single native-command runner
# that reports success honestly on Windows PowerShell, a result factory, and
# a small set of colored console writers so the gate reads the same whoever
# runs it.
#
# Windows PowerShell 5.1 compatible: no ternary, no null-coalescing, no
# null-conditional operators.

Set-StrictMode -Version Latest

# Repo root is 4 levels up from this file (tools/quality/ps/steps -> root).
# Captured at dot-source time so every step resolves paths the same way no
# matter what the caller's current directory is.
$script:RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path

function Get-RepoRoot {
  # The absolute path to the repository root.
  return $script:RepoRoot
}

function New-StepResult {
  # The single shape every step returns. The orchestrator reads these to
  # build the summary table and decide the overall exit code.
  param(
    [Parameter(Mandatory)][string]$Name,
    [bool]$Success = $true,
    [bool]$Skipped = $false,
    [TimeSpan]$Duration = [TimeSpan]::Zero,
    [string]$Detail = ''
  )
  return [pscustomobject]@{
    Name     = $Name
    Success  = $Success
    Skipped  = $Skipped
    Duration = $Duration
    Detail   = $Detail
  }
}

function Write-GateLine {
  # Plain informational line.
  param([string]$Message)
  Write-Host $Message
}

function Write-GateHeader {
  # The banner printed before a step runs.
  param([string]$Message)
  Write-Host ''
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-GatePass {
  param([string]$Message)
  Write-Host "  PASS  $Message" -ForegroundColor Green
}

function Write-GateFail {
  param([string]$Message)
  Write-Host "  FAIL  $Message" -ForegroundColor Red
}

function Write-GateSkip {
  param([string]$Message)
  Write-Host "  SKIP  $Message" -ForegroundColor DarkGray
}

function Invoke-Tool {
  # Run a native command from the repo root and report whether it succeeded.
  #
  # Returns $true when the process exits 0, $false otherwise. Output streams
  # straight to the console so the developer sees the tool's own messages.
  #
  # Deliberately does NOT redirect the child's stderr: in Windows PowerShell,
  # `2>&1` on a native executable wraps each stderr line in an ErrorRecord and
  # flips `$?` to false even on a clean exit, which would make every step look
  # like it failed. We trust the exit code via $LASTEXITCODE instead.
  param(
    [Parameter(Mandatory)][string]$FilePath,
    [string[]]$Arguments = @()
  )

  Push-Location $script:RepoRoot
  try {
    # Pipe the command's stdout to the host rather than letting it fall into
    # this function's output stream. If it leaked into the pipeline it would
    # be returned alongside the success flag, and a failing tool (which prints
    # diagnostics) would make the function return a non-empty array that reads
    # as truthy -- silently turning every failure into a pass. The tool's
    # stderr still flows straight to the console (we never redirect it).
    & $FilePath @Arguments | Out-Host
    return ($LASTEXITCODE -eq 0)
  } finally {
    Pop-Location
  }
}

function Invoke-ToolStep {
  # The whole of a step that runs one tool: the header, the command line it
  # shows, the run, and the PASS/FAIL line and result. Steps that need more
  # than one tool call (or no tool at all) build their result by hand.
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][string]$Header,
    [Parameter(Mandatory)][string]$CommandLine,
    [Parameter(Mandatory)][string[]]$Arguments,
    [Parameter(Mandatory)][string]$FailMessage,
    [Parameter(Mandatory)][string]$FailDetail,
    [string]$FilePath = 'npx'
  )

  $start = [datetime]::UtcNow
  Write-GateHeader "$Name - $Header"
  Write-GateLine "  $CommandLine"

  $ok = Invoke-Tool -FilePath $FilePath -Arguments $Arguments

  $duration = Get-Duration -Start $start
  if ($ok) {
    Write-GatePass $Name
    return New-StepResult -Name $Name -Success $true -Duration $duration
  }

  Write-GateFail "$Name - $FailMessage"
  return New-StepResult -Name $Name -Success $false -Duration $duration -Detail $FailDetail
}

function Get-Duration {
  # Elapsed time from a start timestamp captured with [datetime]::UtcNow.
  param([Parameter(Mandatory)][datetime]$Start)
  return ([datetime]::UtcNow - $Start)
}
