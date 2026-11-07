<#
.SYNOPSIS
  Runs the full quality gate for this app.

.DESCRIPTION
  Sequences the individual checks in tools/quality/ps/steps (health, assets,
  formatting, lint, type check, tests, bundle smoke test), prints a summary, and exits non-zero
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
  Run a single named step instead of the whole gate. Any name in
  $StepNames: CheckHealth, VerifyAssets, VerifyFormatting,
  RunStaticAnalysis, ValidateQuality, ExecuteTests, TestBuild.

.EXAMPLE
  npm run check
  Runs the full strict (ci) gate.

.EXAMPLE
  .\tools\quality\ps\QualityGate.ps1
  Runs the full local gate, auto-fixing formatting and lint.

.EXAMPLE
  .\tools\quality\ps\QualityGate.ps1 -Only ValidateQuality
  Runs only the TypeScript type check.
#>
[CmdletBinding()]
param(
  [ValidateSet('local', 'ci')]
  [string]$Mode = 'local',

  [switch]$SkipBuild,

  # Checked against $StepNames below, so a new step needs no edit here.
  [string]$Only
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# The gate's ordered pipeline. To add a step, add steps/<Name>.ps1 that
# declares Invoke-<Name> -Mode, then add <Name> here.
$StepNames = @(
  'CheckHealth',
  'VerifyAssets',
  'VerifyFormatting',
  'RunStaticAnalysis',
  'ValidateQuality',
  'ExecuteTests',
  'TestBuild'
)
# The step local mode may skip with -SkipBuild.
$BuildStepName = 'TestBuild'

# Load shared helpers and every step. Steps also dot-source Common on their
# own (so they load standalone too); re-running it here is harmless.
. (Join-Path $PSScriptRoot 'steps/Common.ps1')

if ($Only -and ($StepNames -notcontains $Only)) {
  Write-GateFail ("Unknown step '{0}'. Use one of: {1}." -f $Only, ($StepNames -join ', '))
  exit 1
}

foreach ($name in $StepNames) {
  . (Join-Path $PSScriptRoot "steps/$name.ps1")
}

$pipeline = $StepNames
if ($Only) {
  $pipeline = @($Only)
}

Write-GateLine ''
Write-GateLine "Quality gate - mode: $Mode$(if ($Only) { "  (only: $Only)" })"

$results = @()
$aborted = $false

foreach ($stepName in $pipeline) {
  # local mode skips the bundle smoke test when asked, to keep the loop fast.
  if ($stepName -eq $BuildStepName -and $Mode -eq 'local' -and $SkipBuild) {
    Write-GateHeader "$stepName - skipped (-SkipBuild)"
    Write-GateSkip $stepName
    $results += New-StepResult -Name $stepName -Skipped $true -Detail 'skipped via -SkipBuild'
    continue
  }

  try {
    $result = & "Invoke-$stepName" -Mode $Mode
  } catch {
    Write-GateFail "$stepName - threw: $($_.Exception.Message)"
    $result = New-StepResult -Name $stepName -Success $false -Detail $_.Exception.Message
  }
  $results += $result

  # CheckHealth is a hard prerequisite: if the toolchain is broken, every
  # later step fails for the same reason, so stop now with one clear cause.
  if ($stepName -eq 'CheckHealth' -and -not $result.Success) {
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
