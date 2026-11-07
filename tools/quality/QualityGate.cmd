@echo off
REM Double-click entry point for the quality gate.
REM
REM Runs ps\QualityGate.ps1 with an ExecutionPolicy bypass so it works on a
REM machine whose default policy blocks scripts, without changing any
REM machine-wide setting. With no arguments it runs the local (auto-fixing)
REM gate; pass arguments through to override, e.g. QualityGate.cmd -Mode ci.
REM The window stays open after a double-click so the output stays readable.
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0ps\QualityGate.ps1" %*
set "EXITCODE=%ERRORLEVEL%"
if not "%EXITCODE%"=="0" (
  echo.
  echo Script exited with code %EXITCODE%.
)
REM Pause only for a double-click. Explorer starts this file as
REM cmd.exe /c ""PATH" " -- with the quotes removed, it is the only launch
REM that ends in the file path and a space. Terminals and npm do not pause.
setlocal EnableDelayedExpansion
set "LAUNCH=!cmdcmdline:"=!#"
if /i not "!LAUNCH:%~f0 #=!"=="!LAUNCH!" pause
exit /b %EXITCODE%
