# Script para iniciar el backend correctamente para desarrollo móvil
# Uso: .\start-backend-mobile.ps1

Write-Host "🚀 Iniciando Truekealo Backend para desarrollo móvil..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "app\main.py")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde la carpeta backend" -ForegroundColor Red
    Write-Host "   cd Truekealo\backend" -ForegroundColor Yellow
    exit 1
}

# Verificar entorno virtual
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Error: No se encontró el entorno virtual" -ForegroundColor Red
    Write-Host "   Crea el entorno virtual primero:" -ForegroundColor Yellow
    Write-Host "   python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Activando entorno virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "✅ Entorno virtual activado" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Iniciando servidor FastAPI..." -ForegroundColor Yellow
Write-Host "   Host: 0.0.0.0 (accesible desde red local)" -ForegroundColor Gray
Write-Host "   Puerto: 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 URLs para acceder:" -ForegroundColor Cyan
Write-Host "   Desde PC: http://localhost:8000" -ForegroundColor White
Write-Host "   Desde Android Emulator: http://10.0.2.2:8000" -ForegroundColor White
Write-Host "   Desde dispositivo físico: http://TU_IP:8000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación API: http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "⌛ Iniciando..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
