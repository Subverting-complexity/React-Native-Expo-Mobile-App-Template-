@echo off
REM Double-click entry point for the quality gate.
REM
REM Runs QualityGate.ps1 with an ExecutionPolicy bypass so it works on a
REM machine whose default policy blocks scripts, without changing any
REM machine-wide setting. With no arguments it runs the local (auto-fixing)
REM gate; pass arguments through to override, e.g. QualityGate.cmd -Mode ci.
REM The window pauses at the end so a double-clicked run stays readable.
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0QualityGate.ps1" %*
set "EXITCODE=%ERRORLEVEL%"
echo.
pause
exit /b %EXITCODE%
