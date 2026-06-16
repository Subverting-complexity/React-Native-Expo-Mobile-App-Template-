# RunStaticAnalysis.ps1 - ESLint.
#
# Runs the same `eslint .` the project's `lint` script runs, including the
# accessibility and complexity rules in eslint.config.js. local mode adds
# `--fix` to clear auto-fixable findings; ci mode reports only and fails on
# any remaining error.

. "$PSScriptRoot\Common.ps1"

function Invoke-RunStaticAnalysis {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'RunStaticAnalysis - ESLint'

  $eslintArgs = @('eslint', '.')
  if ($Mode -eq 'local') {
    Write-GateLine '  eslint . --fix (auto-fixing lint)'
    $eslintArgs += '--fix'
  } else {
    Write-GateLine '  eslint . (strict)'
  }

  $ok = Invoke-Tool -FilePath 'npx' -Arguments $eslintArgs

  $duration = Get-Duration -Start $start
  if ($ok) {
    Write-GatePass 'RunStaticAnalysis'
    return New-StepResult -Name 'RunStaticAnalysis' -Success $true -Duration $duration
  }

  Write-GateFail 'RunStaticAnalysis - ESLint reported errors'
  return New-StepResult -Name 'RunStaticAnalysis' -Success $false -Duration $duration `
    -Detail 'ESLint reported one or more errors'
}
