<#
.SYNOPSIS
  Runs the full quality gate for this template.

.DESCRIPTION
  Sequences the individual checks in scripts/steps (health, formatting, lint,
  type check, tests, bundle smoke test), prints a summary, and exits non-zero
  if any step failed - so the same command works as a pre-commit gate and as
  the check a CI pipeline runs.

  Two modes:
    local (default) - auto-fixes what it can (Prettier rewrite, ESLint --fix)
                      then verifies. The developer's full local gate.
    ci              - strict: no fixes, fails on any drift, and always runs
                      the bundle smoke test.

.PARAMETER Mode
  'local' (default) or 'ci'. See above.

.PARAMETER SkipBuild
  In local mode, skip the heavy TestBuild step for a faster inner loop.
  Ignored in ci mode (the build always runs there).

.PARAMETER Only
  Run a single named step instead of the whole gate. One of:
  CheckHealth, VerifyFormatting, RunStaticAnalysis, ValidateQuality,
  ExecuteTests, TestBuild.

.EXAMPLE
  npm run check
  Runs the full strict (ci) gate.

.EXAMPLE
  .\scripts\QualityGate.ps1
  Runs the full local gate, auto-fixing formatting and lint.

.EXAMPLE
  .\scripts\QualityGate.ps1 -Only ValidateQuality
  Runs only the TypeScript type check.
#>
[CmdletBinding()]
param(
  [ValidateSet('local', 'ci')]
  [string]$Mode = 'local',

  [switch]$SkipBuild,

  [ValidateSet('CheckHealth', 'VerifyFormatting', 'RunStaticAnalysis',
    'ValidateQuality', 'ExecuteTests', 'TestBuild')]
  [string]$Only
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Load shared helpers and every step. Steps also dot-source Common on their
# own (so they load standalone too); re-running it here is harmless.
. "$PSScriptRoot\steps\Common.ps1"
. "$PSScriptRoot\steps\CheckHealth.ps1"
. "$PSScriptRoot\steps\VerifyFormatting.ps1"
. "$PSScriptRoot\steps\RunStaticAnalysis.ps1"
. "$PSScriptRoot\steps\ValidateQuality.ps1"
. "$PSScriptRoot\steps\ExecuteTests.ps1"
. "$PSScriptRoot\steps\TestBuild.ps1"

# The gate's ordered pipeline. `IsBuild` marks the step local mode may skip.
$pipeline = @(
  [pscustomobject]@{ Name = 'CheckHealth';       Invoke = { Invoke-CheckHealth -Mode $Mode };       IsBuild = $false }
  [pscustomobject]@{ Name = 'VerifyFormatting';  Invoke = { Invoke-VerifyFormatting -Mode $Mode };  IsBuild = $false }
  [pscustomobject]@{ Name = 'RunStaticAnalysis'; Invoke = { Invoke-RunStaticAnalysis -Mode $Mode }; IsBuild = $false }
  [pscustomobject]@{ Name = 'ValidateQuality';   Invoke = { Invoke-ValidateQuality -Mode $Mode };   IsBuild = $false }
  [pscustomobject]@{ Name = 'ExecuteTests';      Invoke = { Invoke-ExecuteTests -Mode $Mode };      IsBuild = $false }
  [pscustomobject]@{ Name = 'TestBuild';         Invoke = { Invoke-TestBuild -Mode $Mode };         IsBuild = $true }
)

if ($Only) {
  $pipeline = $pipeline | Where-Object { $_.Name -eq $Only }
}

Write-GateLine ''
Write-GateLine "Quality gate - mode: $Mode$(if ($Only) { "  (only: $Only)" })"

$results = @()
$aborted = $false

foreach ($step in $pipeline) {
  # local mode skips the bundle smoke test when asked, to keep the loop fast.
  if ($step.IsBuild -and $Mode -eq 'local' -and $SkipBuild) {
    Write-GateHeader "$($step.Name) - skipped (-SkipBuild)"
    Write-GateSkip $step.Name
    $results += New-StepResult -Name $step.Name -Skipped $true -Detail 'skipped via -SkipBuild'
    continue
  }

  try {
    $result = & $step.Invoke
  } catch {
    Write-GateFail "$($step.Name) - threw: $($_.Exception.Message)"
    $result = New-StepResult -Name $step.Name -Success $false -Detail $_.Exception.Message
  }
  $results += $result

  # CheckHealth is a hard prerequisite: if the toolchain is broken, every
  # later step fails for the same reason, so stop now with one clear cause.
  if ($step.Name -eq 'CheckHealth' -and -not $result.Success) {
    $aborted = $true
    break
  }
}

# Summary.
Write-GateLine ''
Write-GateLine '----------------------------------------------'
Write-GateLine ' Quality gate summary'
Write-GateLine '----------------------------------------------'
foreach ($r in $results) {
  if ($r.Skipped) {
    $status = 'SKIP'
  } elseif ($r.Success) {
    $status = 'PASS'
  } else {
    $status = 'FAIL'
  }
  $seconds = ('{0,6:N1}s' -f $r.Duration.TotalSeconds)
  Write-GateLine (' {0,-4}  {1,-20} {2}' -f $status, $r.Name, $seconds)
}
Write-GateLine '----------------------------------------------'

$failed = @($results | Where-Object { -not $_.Success -and -not $_.Skipped })

if ($aborted) {
  Write-GateFail 'Gate aborted: environment is not ready (see CheckHealth above).'
  exit 1
}

if ($failed.Count -gt 0) {
  Write-GateFail ("Gate failed: {0} step(s) failed - {1}" -f $failed.Count, (($failed | ForEach-Object { $_.Name }) -join ', '))
  exit 1
}

Write-GatePass 'Gate passed: all steps green.'
exit 0
