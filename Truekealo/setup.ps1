# Script de configuración inicial para Truekealo
# Ejecutar con: .\setup.ps1

Write-Host "🔄 Configuración inicial de Truekealo" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
Write-Host "📌 Verificando Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python no encontrado. Por favor instala Python 3.8+" -ForegroundColor Red
    exit 1
}

# Verificar si existe .env
Write-Host ""
Write-Host "📌 Verificando archivo .env..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado. Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. Por favor edítalo con tus configuraciones." -ForegroundColor Green
    Write-Host "   IMPORTANTE: Genera una SECRET_KEY segura con:" -ForegroundColor Yellow
    Write-Host "   python -c ""import secrets; print(secrets.token_hex(32))""" -ForegroundColor Cyan
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

# Instalar dependencias
Write-Host ""
Write-Host "📌 Instalando dependencias de Python..." -ForegroundColor Yellow
Set-Location backend

if (!(Test-Path ".venv")) {
    Write-Host "⚠️  Entorno virtual no encontrado. Creando..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "✅ Entorno virtual creado" -ForegroundColor Green
}

Write-Host "📦 Activando entorno virtual e instalando paquetes..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Inicializar base de datos
Write-Host ""
Write-Host "📌 ¿Deseas inicializar la base de datos ahora? (S/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host "🔄 Inicializando base de datos..." -ForegroundColor Yellow
    python init_db.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos inicializada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Error al inicializar la base de datos. Verifica tu configuración." -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Omitiendo inicialización de base de datos" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Edita el archivo .env con tus configuraciones" -ForegroundColor White
Write-Host "2. Asegúrate de que MariaDB/MySQL esté corriendo" -ForegroundColor White
Write-Host "3. Ejecuta el backend con:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "   uvicorn app.main:app --reload" -ForegroundColor Yellow
Write-Host "4. Abre el frontend en un servidor web (puerto 5500)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación completa: README.md" -ForegroundColor Cyan
Write-Host "🌐 API Docs: http://localhost:8000/api/docs" -ForegroundColor Cyan
