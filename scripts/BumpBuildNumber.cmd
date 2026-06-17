@echo off
REM Double-click wrapper for BumpBuildNumber.ps1.
REM Forwards any arguments through to the PowerShell script and keeps the
REM window open so the output is readable after a double-click.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0BumpBuildNumber.ps1" %*
set EXITCODE=%ERRORLEVEL%
if not "%EXITCODE%"=="0" (
  echo.
  echo Script exited with code %EXITCODE%.
)
pause
exit /b %EXITCODE%
