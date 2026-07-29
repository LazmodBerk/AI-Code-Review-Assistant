@echo off
echo Starting AI Code Review Assistant...
if not exist .env (
    copy .env.example .env
    echo Created .env from example. Edit it to configure LLM providers.
)
docker-compose up --build -d
echo.
echo Application is starting...
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
pause
