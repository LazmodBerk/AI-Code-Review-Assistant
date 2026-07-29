@echo off
cd /d "%~dp0..\backend"
python -m uvicorn main:app --port 8000
