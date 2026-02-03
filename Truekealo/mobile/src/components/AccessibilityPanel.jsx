import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '../context/AccessibilityContext';
import { COLORS } from '../constants/config';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    increaseFontSize,
    decreaseFontSize,
    toggleGrayscale,
    toggleHighContrast,
    toggleInvertColors,
    toggleLightBackground,
    toggleUnderlineLinks,
    toggleReadableFont,
    setReadingSpeed,
    resetAll,
  } = useAccessibility();

  // Calcular porcentaje de tamaño de fuente (75% - 150%)
  const fontSizeDisplay = Math.round(((settings.fontSize - 0.75) / 0.75) * 100);
  
  const hasActiveSettings =
    settings.fontSize !== 1 ||
    settings.grayscale ||
    settings.highContrast ||
    settings.invertColors ||
    settings.lightBackground ||
    settings.underlineLinks ||
    settings.readableFont ||
    settings.readingSpeed !== 1;

  return (
    <>
      {/* Botón flotante */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          hasActiveSettings && styles.floatingButtonActive,
        ]}
        onPress={() => setIsOpen(true)}
        accessibilityLabel="Abrir panel de accesibilidad"
        accessibilityHint="Abre el menú con opciones de accesibilidad"
      >
        <Ionicons name="accessibility" size={28} color="#fff" />
        {hasActiveSettings && <View style={styles.indicator} />}
      </TouchableOpacity>

      {/* Modal del panel */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Ionicons name="accessibility" size={24} color={COLORS.primary} />
                <Text style={styles.title}>Accesibilidad</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                accessibilityLabel="Cerrar panel"
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Sección: Tamaño de texto */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Tamaño de Texto</Text>
                <View style={styles.controlGroup}>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      settings.fontSize <= 0.75 && styles.controlButtonDisabled,
                    ]}
                    onPress={decreaseFontSize}
                    disabled={settings.fontSize <= 0.75}
                    accessibilityLabel="Reducir tamaño de texto"
                  >
                    <Text style={styles.controlButtonText}>A−</Text>
                  </TouchableOpacity>

                  <View style={styles.fontSizeDisplay}>
                    <Text style={styles.fontSizeText}>{fontSizeDisplay}%</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      settings.fontSize >= 1.5 && styles.controlButtonDisabled,
                    ]}
                    onPress={increaseFontSize}
                    disabled={settings.fontSize >= 1.5}
                    accessibilityLabel="Aumentar tamaño de texto"
                  >
                    <Text style={styles.controlButtonText}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sección: Contraste y Colores */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎨 Contraste y Colores</Text>

                <View style={styles.checkboxControl}>
                  <Text style={styles.checkboxLabel}>Escala de grises</Text>
                  <Switch
                    value={settings.grayscale}
                    onValueChange={toggleGrayscale}
                    trackColor={{ false: '#ccc', true: COLORS.primary }}
                    accessibilityLabel="Activar escala de grises"
                  />
                </View>

                <View style={styles.checkboxControl}>
                  <Text style={styles.checkboxLabel}>Alto contraste</Text>
                  <Switch
                    value={settings.highContrast}
                    onValueChange={toggleHighContrast}
                    trackColor={{ false: '#ccc', true: COLORS.primary }}
                    accessibilityLabel="Activar alto contraste"
                  />
                </View>

                <View style={styles.checkboxControl}>
                  <Text style={styles.checkboxLabel}>Invertir colores</Text>
                  <Switch
                    value={settings.invertColors}
                    onValueChange={toggleInvertColors}
                    trackColor={{ false: '#ccc', true: COLORS.primary }}
                    accessibilityLabel="Activar inversión de colores"
                  />
                </View>

                <View style={styles.checkboxControl}>
                  <Text style={styles.checkboxLabel}>Fondo claro</Text>
                  <Switch
                    value={settings.lightBackground}
                    onValueChange={toggleLightBackground}
                    trackColor={{ false: '#ccc', true: COLORS.primary }}
                    accessibilityLabel="Activar fondo claro"
                  />
                </View>
              </View>

              {/* Sección: Enlaces y Fuentes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔤 Enlaces y Fuentes</Text>

                <View style={styles.checkboxControl}>
                  <Text style={styles.checkboxLabel}>Subrayar enlaces</Text>
                  <Switch
                    value={settings.underlineLinks}
                    onValueChange={toggleUnderlineLinks}
                    trackColor={{ false: '#ccc', true: COLORS.primary }}
                    accessibilityLabel="Activar subrayado de enlaces"
                  />
                </View>

                <View style={styles.checkboxControl}>
                  <Text style={styles.checkboxLabel}>Fuente legible</Text>
                  <Switch
                    value={settings.readableFont}
                    onValueChange={toggleReadableFont}
                    trackColor={{ false: '#ccc', true: COLORS.primary }}
                    accessibilityLabel="Activar fuente más legible"
                  />
                </View>
              </View>

              {/* Sección: Velocidad de Lectura */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔊 Velocidad de Lectura</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    Velocidad: {settings.readingSpeed.toFixed(1)}x
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0.5}
                    maximumValue={2}
                    step={0.1}
                    value={settings.readingSpeed}
                    onValueChange={setReadingSpeed}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor="#ccc"
                    thumbTintColor={COLORS.primary}
                    accessibilityLabel="Control de velocidad de lectura"
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>0.5x</Text>
                    <Text style={styles.sliderLabelText}>2.0x</Text>
                  </View>
                </View>
              </View>

              {/* Sección: Restablecer */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    resetAll();
                    setIsOpen(false);
                  }}
                  accessibilityLabel="Restablecer todas las configuraciones de accesibilidad"
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.resetButtonText}>Restablecer cambios</Text>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  ℹ️ Todas las preferencias se guardan automáticamente
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  floatingButtonActive: {
    backgroundColor: COLORS.success,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },
  controlButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fontSizeDisplay: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  fontSizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  checkboxControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkboxLabel: {
    fontSize: 15,
    color: COLORS.text,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  sliderLabelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resetButton: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    textAlign: 'center',
  },
});

export default AccessibilityPanel;
