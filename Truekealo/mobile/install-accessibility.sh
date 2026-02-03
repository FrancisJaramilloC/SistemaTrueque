#!/bin/bash
# Script para instalar dependencias de accesibilidad en Truekealo Mobile

echo "======================================"
echo "  Truekealo Mobile - Accesibilidad"
echo "======================================"
echo ""
echo "Instalando dependencias necesarias..."
echo ""

# Navegar al directorio mobile
cd "$(dirname "$0")"

# Instalar dependencias
npx expo install @react-native-async-storage/async-storage expo-speech @react-native-community/slider

echo ""
echo "✅ Dependencias instaladas correctamente!"
echo ""
echo "Dependencias agregadas:"
echo "  - @react-native-async-storage/async-storage"
echo "  - expo-speech"
echo "  - @react-native-community/slider"
echo ""
echo "📖 Para más información, consulta:"
echo "   - mobile/ACCESIBILIDAD.md"
echo "   - docs/IMPLEMENTACION_ACCESIBILIDAD_MOBILE.md"
echo ""
echo "🚀 Inicia la app con: npm start"
echo ""
