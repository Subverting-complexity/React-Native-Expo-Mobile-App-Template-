# TestBuild.ps1 - Expo bundle smoke test.
#
# Proves the app still bundles by running a web export to a throwaway temp
# directory, then deletes it. This catches breakage that type checking alone
# misses: a bad Metro/Babel config, an unresolved import, an asset that fails
# to bundle. It is the heaviest step, so the orchestrator runs it last and
# lets local mode skip it (`-SkipBuild`) to keep the inner loop fast; ci mode
# always runs it.

. "$PSScriptRoot\Common.ps1"

function Invoke-TestBuild {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $start = [datetime]::UtcNow
  Write-GateHeader 'TestBuild - Expo web bundle smoke test'

  $outDir = Join-Path ([System.IO.Path]::GetTempPath()) "qg-build-$PID"
  Write-GateLine "  expo export --platform web --output-dir <temp>"

  try {
    $ok = Invoke-Tool -FilePath 'npx' -Arguments @(
      'expo', 'export', '--platform', 'web', '--output-dir', $outDir
    )
  } finally {
    if (Test-Path $outDir) {
      Remove-Item -Recurse -Force $outDir -ErrorAction SilentlyContinue
    }
  }

  $duration = Get-Duration -Start $start
  if ($ok) {
    Write-GatePass 'TestBuild'
    return New-StepResult -Name 'TestBuild' -Success $true -Duration $duration
  }

  Write-GateFail 'TestBuild - bundle failed'
  return New-StepResult -Name 'TestBuild' -Success $false -Duration $duration `
    -Detail 'expo export did not complete successfully'
}
