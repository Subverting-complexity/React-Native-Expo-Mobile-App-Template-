# TestBuild.ps1 - Expo bundle smoke test.
#
# Proves the app still bundles by running a web export to a throwaway temp
# directory, then deletes it. This catches breakage that type checking alone
# misses: a bad Metro/Babel config, an unresolved import, an asset that fails
# to bundle. It is the heaviest step, so the orchestrator runs it last and
# lets local mode skip it (`-SkipBuild`) to keep the inner loop fast; ci mode
# always runs it.

. (Join-Path $PSScriptRoot 'Common.ps1')

function Invoke-TestBuild {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  $outDir = Join-Path ([System.IO.Path]::GetTempPath()) "qg-build-$PID"
  try {
    return Invoke-ToolStep -Name 'TestBuild' -Header 'Expo web bundle smoke test' `
      -CommandLine 'expo export --platform web --output-dir <temp>' `
      -Arguments @('expo', 'export', '--platform', 'web', '--output-dir', $outDir) `
      -FailMessage 'bundle failed' -FailDetail 'expo export did not complete successfully'
  } finally {
    if (Test-Path $outDir) {
      Remove-Item -Recurse -Force $outDir -ErrorAction SilentlyContinue
    }
  }
}
