@echo off
title CRM B2B Naturebarr - Sistema Comercial
cd /d "%~dp0"
echo ==============================================================================
echo             INICIANDO CRM B2B NATUREBARR (SALVADOR - SP - SC)
echo ==============================================================================
echo.

echo [1/2] Iniciando Backend FastAPI (Porta 8000)...
start "Naturebarr Backend API" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 >nul

echo [2/2] Iniciando Frontend React Vite (Porta 5173)...
start "Naturebarr Frontend React" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul

echo.
echo ==============================================================================
echo Sistema inicializado com sucesso!
echo - Frontend:  http://localhost:5173
echo - API Docs:  http://localhost:8000/docs
echo ==============================================================================

start http://localhost:5173
