# ExecuteTests.ps1 - Jest with coverage.
#
# Runs the jest-expo suite with coverage collection. `--passWithNoTests` keeps
# a fresh template (or a slice that has not added tests yet) from failing the
# gate purely for having no tests; the 70% coverage *threshold* is wired up
# separately in story #41 via jest's `coverageThreshold`.

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
