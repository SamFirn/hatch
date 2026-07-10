@echo off
title HATCH::CHAT server (24/7 auto-restart)
cd /d "%~dp0"
echo ============================================
echo   HATCH::CHAT  -  always-on server
echo   Overlay:  http://localhost:8787/overlay.html
echo   Chat box: http://localhost:8787/control.html
echo   (Close this window to stop the stream.)
echo ============================================
echo.
:loop
echo [%date% %time%] starting server...
node server.js
echo.
echo [%date% %time%] server stopped (exit %errorlevel%). Restarting in 3s...
echo   -- press Ctrl+C now, or close this window, to stop for good --
timeout /t 3 /nobreak >nul
goto loop
