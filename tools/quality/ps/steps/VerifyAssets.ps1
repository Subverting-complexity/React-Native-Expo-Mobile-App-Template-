# VerifyAssets.ps1 - the artwork referenced by app.config.ts must exist.
#
# An EAS cloud build fails late - after the queue, after the install - when an
# icon or splash image named in the config is missing, and a zero-byte file
# fails even later, at store submission. Both are cheap to catch here. This
# step reads the evaluated config (`expo config --json`) and asserts every
# local image path in it exists and is non-empty, so the list never has to be
# kept in step with app.config.ts by hand.
#
# It deliberately does NOT validate dimensions or content: a placeholder is
# fine for development (the template ships placeholders), and content review
# belongs to a human (see docs/app-artwork.md). Existence and non-emptiness are the two
# properties a build cannot proceed without.

. (Join-Path $PSScriptRoot 'Common.ps1')

# Every string in the config that is a local image path, such as
# './assets/icon.png', wherever it sits (top level, platform block, plugin options).
function Get-ConfigImagePaths {
  param($Node)

  if ($null -eq $Node) { return }
  if ($Node -is [string]) {
    if ($Node -match '^\./.+\.(png|jpe?g|gif|webp|svg)$') { $Node.Substring(2) }
    return
  }
  if ($Node -is [System.Collections.IEnumerable]) {
    foreach ($item in $Node) { Get-ConfigImagePaths -Node $item }
    return
  }
  if ($Node -is [System.Management.Automation.PSCustomObject]) {
    foreach ($property in $Node.PSObject.Properties) { Get-ConfigImagePaths -Node $property.Value }
  }
}

function Invoke-VerifyAssets {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'VerifyAssets - app artwork referenced by app.config.ts'
  Write-GateLine '  expo config --json'

  $repoRoot = Get-RepoRoot

  Push-Location $repoRoot
  try {
    $configJson = (& npx expo config --json) -join "`n"
    $configCode = $LASTEXITCODE
  } finally {
    Pop-Location
  }

  $problems = @()
  $required = @()
  if ($configCode -ne 0) {
    $problems += "expo config exited with code $configCode"
  } else {
    $required = @(Get-ConfigImagePaths -Node ($configJson | ConvertFrom-Json) | Sort-Object -Unique)
    if ($required.Count -eq 0) {
      $problems += 'app.config.ts names no local images; expected at least the app icon'
    }
  }

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
