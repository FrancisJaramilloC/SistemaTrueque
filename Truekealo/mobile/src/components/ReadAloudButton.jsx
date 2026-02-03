import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '../context/AccessibilityContext';
import { COLORS } from '../constants/config';

/**
 * Botón flotante para leer el contenido de la pantalla en voz alta
 * Se debe colocar en cada pantalla donde se desee habilitar lectura
 */
const ReadAloudButton = ({ text, bottom = 20, right = 20 }) => {
  const { settings, startReading, stopReading } = useAccessibility();

  const handlePress = () => {
    if (settings.isReading) {
      stopReading();
    } else {
      startReading(text);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { bottom, right }]}
      onPress={handlePress}
      accessibilityLabel={
        settings.isReading ? 'Detener lectura en voz alta' : 'Leer contenido en voz alta'
      }
    >
      <Ionicons
        name={settings.isReading ? 'stop' : 'volume-high'}
        size={24}
        color="#fff"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ReadAloudButton;
