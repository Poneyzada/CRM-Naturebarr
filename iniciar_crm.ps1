Set-Location $PSScriptRoot
Write-Host "==============================================================================" -ForegroundColor DarkCyan
Write-Host "             INICIANDO CRM B2B NATUREBARR (SALVADOR - SP - SC)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor DarkCyan
Write-Host ""

Write-Host "[1/2] Iniciando Backend FastAPI (Porta 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "[2/2] Iniciando Frontend React Vite (Porta 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "Sistema comercial em execução!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Swagger:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green

Start-Process "http://localhost:5173"
