# RunStaticAnalysis.ps1 - ESLint.
#
# Runs the same `eslint . --max-warnings 0` the project's `lint` script runs,
# including the accessibility and complexity rules in eslint.config.js. local
# mode adds `--fix` to clear auto-fixable findings; ci mode reports only and
# fails on any remaining error or warning.

. (Join-Path $PSScriptRoot 'Common.ps1')

function Invoke-RunStaticAnalysis {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  # --max-warnings 0 matches the `lint` script: a warning fails the gate.
  $eslintArgs = @('eslint', '.', '--max-warnings', '0')
  if ($Mode -eq 'local') {
    $commandLine = 'eslint . --max-warnings 0 --fix (auto-fixing lint)'
    $eslintArgs += '--fix'
  } else {
    $commandLine = 'eslint . --max-warnings 0 (strict)'
  }

  return Invoke-ToolStep -Name 'RunStaticAnalysis' -Header 'ESLint' `
    -CommandLine $commandLine -Arguments $eslintArgs `
    -FailMessage 'ESLint reported errors' -FailDetail 'ESLint reported one or more errors'
}
