@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>&1
if errorlevel 1 (
  echo Install Python 3 and run this launcher again.
  pause
  exit /b 1
)
echo Open http://127.0.0.1:8174 in your browser. Close this window to stop PaperPulse.
python -m http.server 8174 --bind 127.0.0.1 --directory dist
if errorlevel 1 pause

