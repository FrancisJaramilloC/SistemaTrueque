# Script para iniciar el backend de Truekealo
Write-Host "🚀 Iniciando backend de Truekealo..." -ForegroundColor Green
Write-Host "📍 IP: 192.168.0.3:8001" -ForegroundColor Cyan
Write-Host "⚠️  Presiona CTRL+C para detener" -ForegroundColor Yellow
Write-Host ""

# Activar entorno virtual si existe
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    Write-Host "✅ Activando entorno virtual..." -ForegroundColor Cyan
    & ".\venv\Scripts\Activate.ps1"
}

Write-Host "🔄 Iniciando servidor uvicorn..." -ForegroundColor Cyan
Write-Host ""

python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
