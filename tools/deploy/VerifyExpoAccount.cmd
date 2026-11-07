@echo off
REM Double-click wrapper for ps\VerifyExpoAccount.ps1.
REM Forwards any arguments through to the PowerShell script and keeps the
REM window open after a double-click so the output stays readable.
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0ps\VerifyExpoAccount.ps1" %*
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
