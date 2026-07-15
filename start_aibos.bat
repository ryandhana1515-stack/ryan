@echo off
title AI Business OS - Server
cd /d "%~dp0"

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher 'py' not found. Install Python from python.org and tick "Add to PATH".
  pause
  exit /b 1
)

if not exist aibos.db (
  echo First run - setting up your company and AI employees...
  py -m app.seed
)

echo Starting AI Business OS... keep this window open while you use the app.
start "" /min cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:8000"
py -m uvicorn app.main:app --port 8000
pause
