# ValidateQuality.ps1 - TypeScript type checking.
#
# Runs `tsc --noEmit` against the strict tsconfig. There is nothing to
# auto-fix here, so the behaviour is identical in both modes: a type error is
# always a failure. This is the gate that enforces "no `any`, no
# `// @ts-ignore`" at the type level.

. "$PSScriptRoot\Common.ps1"

function Invoke-ValidateQuality {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'ValidateQuality - TypeScript (tsc --noEmit)'
  Write-GateLine '  tsc --noEmit'

  $ok = Invoke-Tool -FilePath 'npx' -Arguments @('tsc', '--noEmit')

  $duration = Get-Duration -Start $start
  if ($ok) {
    Write-GatePass 'ValidateQuality'
    return New-StepResult -Name 'ValidateQuality' -Success $true -Duration $duration
  }

  Write-GateFail 'ValidateQuality - TypeScript reported errors'
  return New-StepResult -Name 'ValidateQuality' -Success $false -Duration $duration `
    -Detail 'tsc reported type errors'
}
