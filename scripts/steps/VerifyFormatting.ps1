# VerifyFormatting.ps1 - Prettier.
#
# local mode rewrites files in place (`--write`) so the developer's tree is
# left correctly formatted. ci mode only checks (`--check`) and fails on any
# drift, so the pipeline never silently reformats committed code.

. "$PSScriptRoot\Common.ps1"

function Invoke-VerifyFormatting {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'VerifyFormatting - Prettier'

  if ($Mode -eq 'local') {
    Write-GateLine '  prettier --write . (auto-fixing formatting)'
    $ok = Invoke-Tool -FilePath 'npx' -Arguments @('prettier', '--write', '.')
  } else {
    Write-GateLine '  prettier --check . (strict)'
    $ok = Invoke-Tool -FilePath 'npx' -Arguments @('prettier', '--check', '.')
  }

  $duration = Get-Duration -Start $start
  if ($ok) {
    Write-GatePass 'VerifyFormatting'
    return New-StepResult -Name 'VerifyFormatting' -Success $true -Duration $duration
  }

  Write-GateFail 'VerifyFormatting - formatting issues found'
  return New-StepResult -Name 'VerifyFormatting' -Success $false -Duration $duration `
    -Detail 'Prettier reported formatting differences'
}
