# VerifyFormatting.ps1 - Prettier.
#
# local mode rewrites files in place (`--write`) so the developer's tree is
# left correctly formatted. ci mode only checks (`--check`) and fails on any
# drift, so the pipeline never silently reformats committed code.

. (Join-Path $PSScriptRoot 'Common.ps1')

function Invoke-VerifyFormatting {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  if ($Mode -eq 'local') {
    $commandLine = 'prettier --write . (auto-fixing formatting)'
    $prettierArgs = @('prettier', '--write', '.')
  } else {
    $commandLine = 'prettier --check . (strict)'
    $prettierArgs = @('prettier', '--check', '.')
  }

  return Invoke-ToolStep -Name 'VerifyFormatting' -Header 'Prettier' `
    -CommandLine $commandLine -Arguments $prettierArgs `
    -FailMessage 'formatting issues found' -FailDetail 'Prettier reported formatting differences'
}
