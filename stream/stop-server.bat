@echo off
REM Stops ONLY the HATCH stream server (whatever is listening on port 8787).
REM Leaves OpenClaw's gateway and every other Node app running.
set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8787" ^| findstr LISTENING') do (
  echo Stopping HATCH stream server (PID %%p)...
  taskkill /F /PID %%p
  set FOUND=1
)
if "%FOUND%"=="0" echo No stream server was running on port 8787.
echo.
pause
