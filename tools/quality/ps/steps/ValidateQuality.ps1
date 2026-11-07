# ValidateQuality.ps1 - TypeScript type checking.
#
# Runs `npm run typecheck`: `tsc --noEmit` against the strict tsconfig, then
# again with tsconfig.test.json so the tests are checked too. There is nothing to
# auto-fix here, so the behaviour is identical in both modes: a type error is
# always a failure. This is the gate that enforces "no `any`, no
# `// @ts-ignore`" at the type level.

. (Join-Path $PSScriptRoot 'Common.ps1')

function Invoke-ValidateQuality {
  param([ValidateSet('local', 'ci')][string]$Mode = 'local')

  return Invoke-ToolStep -Name 'ValidateQuality' -Header 'TypeScript (npm run typecheck)' `
    -CommandLine 'npm run typecheck' -FilePath 'npm' -Arguments @('run', 'typecheck') `
    -FailMessage 'TypeScript reported errors' -FailDetail 'tsc reported type errors'
}
