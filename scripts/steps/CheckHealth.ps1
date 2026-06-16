# CheckHealth.ps1 - verify the toolchain is present before anything else runs.
#
# This is a hard prerequisite: if Node, npm, or the installed dependencies are
# missing, every later step would fail for the same reason, so the gate aborts
# here with one clear message instead of a cascade of confusing errors.

. "$PSScriptRoot\Common.ps1"

function Invoke-CheckHealth {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'CheckHealth - toolchain & dependencies'

  $problems = @()

  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    $nodeVersion = (& node --version)
    Write-GateLine "  node $nodeVersion"
  } else {
    $problems += 'node not found on PATH'
  }

  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if ($npm) {
    $npmVersion = (& npm --version)
    Write-GateLine "  npm  $npmVersion"
  } else {
    $problems += 'npm not found on PATH'
  }

  $modules = Join-Path (Get-RepoRoot) 'node_modules'
  if (Test-Path $modules) {
    Write-GateLine '  dependencies installed (node_modules present)'
  } else {
    $problems += 'node_modules missing - run "npm ci" (or "npm install") first'
  }

  $duration = Get-Duration -Start $start
  if ($problems.Count -eq 0) {
    Write-GatePass 'CheckHealth'
    return New-StepResult -Name 'CheckHealth' -Success $true -Duration $duration
  }

  foreach ($p in $problems) { Write-GateFail $p }
  return New-StepResult -Name 'CheckHealth' -Success $false -Duration $duration `
    -Detail ($problems -join '; ')
}
