#!/bin/bash
set -e
echo 'Starting AI Code Review Assistant...'
[ ! -f .env ] && cp .env.example .env && echo 'Created .env from example'
docker-compose up --build -d
echo 'Application started!'
echo 'Frontend: http://localhost'
echo 'Backend API: http://localhost:8000'
echo 'API Docs: http://localhost:8000/docs'
