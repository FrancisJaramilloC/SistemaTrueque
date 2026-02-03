# Script PowerShell para instalar dependencias de accesibilidad en Truekealo Mobile

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Truekealo Mobile - Accesibilidad" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Instalando dependencias necesarias..." -ForegroundColor Yellow
Write-Host ""

# Navegar al directorio del script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Instalar dependencias
npx expo install @react-native-async-storage/async-storage expo-speech @react-native-community/slider

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Dependencias instaladas correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Dependencias agregadas:" -ForegroundColor White
    Write-Host "  - @react-native-async-storage/async-storage" -ForegroundColor Gray
    Write-Host "  - expo-speech" -ForegroundColor Gray
    Write-Host "  - @react-native-community/slider" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 Para más información, consulta:" -ForegroundColor White
    Write-Host "   - mobile/ACCESIBILIDAD.md" -ForegroundColor Gray
    Write-Host "   - docs/IMPLEMENTACION_ACCESIBILIDAD_MOBILE.md" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Inicia la app con: npm start" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    Write-Host "Por favor, ejecuta manualmente:" -ForegroundColor Yellow
    Write-Host "  npm install @react-native-async-storage/async-storage expo-speech" -ForegroundColor Gray
    Write-Host ""
}
