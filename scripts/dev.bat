@echo off
echo Starting development servers...
cd /d "%~dp0.."
start "Backend" cmd /k "cd backend && pip install -r requirements.txt && python -m uvicorn main:app --reload --port 8000"
timeout /t 3 /nobreak
start "Frontend" cmd /k "cd frontend && npm install && npm run dev"
echo.
echo Development servers starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
