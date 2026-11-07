# ExecuteTests.ps1 - Jest with coverage.
#
# Runs the jest-expo suite with coverage collection. `--passWithNoTests` keeps
# a run that finds no tests from failing the gate for that reason alone. The 70% global coverage *threshold* lives in
# jest's `coverageThreshold` (package.json), measured against the whole
# `src`/`app` tree via `collectCoverageFrom`; jest exits non-zero here when
# coverage drops below it, so this step enforces the gate with no extra logic.

. (Join-Path $PSScriptRoot 'Common.ps1')

function Invoke-ExecuteTests {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  # `--` after `jest` is unnecessary when invoking the binary directly (npm
  # needs it to pass flags through its script wrapper; npx does not).
  return Invoke-ToolStep -Name 'ExecuteTests' -Header 'Jest (coverage)' `
    -CommandLine 'jest --coverage --passWithNoTests' `
    -Arguments @('jest', '--coverage', '--passWithNoTests') `
    -FailMessage 'one or more tests failed' -FailDetail 'Jest reported failing tests'
}
