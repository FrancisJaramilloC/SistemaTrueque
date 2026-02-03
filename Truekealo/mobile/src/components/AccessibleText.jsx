import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Componente Text mejorado con soporte de accesibilidad
 * Aplica automáticamente el escalado de fuente según las preferencias del usuario
 */
const AccessibleText = ({ style, children, baseSize = 16, ...props }) => {
  const { settings, getScaledSize } = useAccessibility();

  // Calcular el tamaño escalado
  const scaledSize = getScaledSize(baseSize);

  // Aplicar fuente legible si está activada
  const fontFamily = settings.readableFont ? 'Arial' : undefined;

  const accessibleStyle = [
    style,
    {
      fontSize: scaledSize,
      fontFamily,
      letterSpacing: settings.readableFont ? 0.5 : undefined,
      lineHeight: settings.readableFont ? scaledSize * 1.6 : undefined,
    },
  ];

  return (
    <RNText style={accessibleStyle} {...props}>
      {children}
    </RNText>
  );
};

export default AccessibleText;
