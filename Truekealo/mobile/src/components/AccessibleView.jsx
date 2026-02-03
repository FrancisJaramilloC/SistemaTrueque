import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { COLORS } from '../constants/config';

/**
 * Componente View mejorado con soporte de accesibilidad
 * Aplica automáticamente los estilos de accesibilidad (filtros, colores, etc.)
 */
const AccessibleView = ({ style, children, applyFilters = true, ...props }) => {
  const { settings } = useAccessibility();

  // Crear array de transformaciones
  const getTransformStyle = () => {
    const transforms = [];

    // Escala de grises
    if (applyFilters && settings.grayscale) {
      // En React Native, simularemos escala de grises con opacity reducida en componentes de color
      // Esto se debe aplicar individualmente en cada componente con color
    }

    return transforms;
  };

  // Aplicar colores invertidos y alto contraste
  const getColorStyle = () => {
    let backgroundColor = undefined;
    let borderColor = undefined;

    if (applyFilters && settings.lightBackground) {
      backgroundColor = '#FFFFFF';
    }

    // Alto contraste: aumentar intensidad de bordes si existen
    if (applyFilters && settings.highContrast && style?.borderColor) {
      borderColor = '#000000';
    }

    return { backgroundColor, borderColor };
  };

  const accessibleStyle = [
    style,
    getColorStyle(),
  ];

  return (
    <View style={accessibleStyle} {...props}>
      {children}
    </View>
  );
};

export default AccessibleView;
