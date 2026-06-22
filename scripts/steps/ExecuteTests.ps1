# ExecuteTests.ps1 - Jest with coverage.
#
# Runs the jest-expo suite with coverage collection. `--passWithNoTests` keeps
# a fresh template (or a slice that has not added tests yet) from failing the
# gate purely for having no tests. The 70% global coverage *threshold* lives in
# jest's `coverageThreshold` (package.json), measured against the whole
# `src`/`app` tree via `collectCoverageFrom`; jest exits non-zero here when
# coverage drops below it, so this step enforces the gate with no extra logic.

. "$PSScriptRoot\Common.ps1"

function Invoke-ExecuteTests {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'ExecuteTests - Jest (coverage)'
  Write-GateLine '  jest --coverage --passWithNoTests'

  # `--` after `jest` is unnecessary when invoking the binary directly (npm
  # needs it to pass flags through its script wrapper; npx does not).
  $ok = Invoke-Tool -FilePath 'npx' -Arguments @('jest', '--coverage', '--passWithNoTests')

  $duration = Get-Duration -Start $start
  if ($ok) {
    Write-GatePass 'ExecuteTests'
    return New-StepResult -Name 'ExecuteTests' -Success $true -Duration $duration
  }

  Write-GateFail 'ExecuteTests - one or more tests failed'
  return New-StepResult -Name 'ExecuteTests' -Success $false -Duration $duration `
    -Detail 'Jest reported failing tests'
}
