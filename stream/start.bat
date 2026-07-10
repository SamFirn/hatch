@echo off
REM ── Double-click to start the HATCH::CHAT stream server ──
cd /d "%~dp0"
echo Starting HATCH stream server...
echo.
node server.js
echo.
echo Server stopped. Press any key to close.
pause >nul
