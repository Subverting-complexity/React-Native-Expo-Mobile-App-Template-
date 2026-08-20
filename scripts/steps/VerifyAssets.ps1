# VerifyAssets.ps1 - the artwork referenced by app.config.ts must exist.
#
# An EAS cloud build fails late - after the queue, after the install - when an
# icon or splash image named in the config is missing, and a zero-byte file
# fails even later, at store submission. Both are cheap to catch here. This
# step asserts every image app.config.ts references exists and is non-empty.
#
# It deliberately does NOT validate dimensions or content: a placeholder is
# fine for development (the template ships placeholders), and content review
# belongs to a human. Existence and non-emptiness are the two properties a
# build cannot proceed without.

. "$PSScriptRoot\Common.ps1"

function Invoke-VerifyAssets {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'VerifyAssets - app artwork referenced by app.config.ts'

  $repoRoot = Get-RepoRoot

  # The images app.config.ts references. Update this list when the config
  # gains or loses an asset reference.
  $required = @(
    'assets/icon.png',
    'assets/adaptive-icon.png',
    'assets/splash-icon.png',
    'assets/favicon.png'
  )

  $problems = @()
  foreach ($relative in $required) {
    $full = Join-Path $repoRoot $relative
    if (-not (Test-Path $full)) {
      $problems += "$relative is missing"
      continue
    }
    $size = (Get-Item $full).Length
    if ($size -eq 0) {
      $problems += "$relative is empty (0 bytes)"
      continue
    }
    Write-GateLine ("  {0}  {1:N0} bytes" -f $relative, $size)
  }

  $duration = Get-Duration -Start $start
  if ($problems.Count -eq 0) {
    Write-GatePass 'VerifyAssets'
    return New-StepResult -Name 'VerifyAssets' -Success $true -Duration $duration
  }

  foreach ($p in $problems) { Write-GateFail $p }
  return New-StepResult -Name 'VerifyAssets' -Success $false -Duration $duration `
    -Detail ($problems -join '; ')
}
