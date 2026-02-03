import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { Appearance } from 'react-native';

const ACCESSIBILITY_STORAGE_KEY = '@truekealo_accessibility_preferences';

const DEFAULT_SETTINGS = {
  fontSize: 1, // 0.75 a 1.5
  grayscale: false,
  highContrast: false,
  invertColors: false,
  lightBackground: false,
  underlineLinks: false,
  readableFont: false,
  readingSpeed: 1, // 0.5 a 2
  isReading: false,
};

const AccessibilityContext = createContext({
  settings: DEFAULT_SETTINGS,
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  toggleGrayscale: () => {},
  toggleHighContrast: () => {},
  toggleInvertColors: () => {},
  toggleLightBackground: () => {},
  toggleUnderlineLinks: () => {},
  toggleReadableFont: () => {},
  setReadingSpeed: () => {},
  startReading: () => {},
  stopReading: () => {},
  resetAll: () => {},
  getScaledSize: () => {},
});

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar preferencias al iniciar
  useEffect(() => {
    loadSettings();
  }, []);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    if (isInitialized) {
      saveSettings();
    }
  }, [settings, isInitialized]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          isReading: false, // No persistir estado de lectura
        }));
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const saveSettings = async () => {
    try {
      const { isReading, ...persistableSettings } = settings;
      await AsyncStorage.setItem(
        ACCESSIBILITY_STORAGE_KEY,
        JSON.stringify(persistableSettings)
      );
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const increaseFontSize = () => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 0.1, 1.5),
    }));
  };

  const decreaseFontSize = () => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 0.1, 0.75),
    }));
  };

  const toggleGrayscale = () => {
    updateSetting('grayscale', !settings.grayscale);
  };

  const toggleHighContrast = () => {
    updateSetting('highContrast', !settings.highContrast);
  };

  const toggleInvertColors = () => {
    updateSetting('invertColors', !settings.invertColors);
  };

  const toggleLightBackground = () => {
    updateSetting('lightBackground', !settings.lightBackground);
  };

  const toggleUnderlineLinks = () => {
    updateSetting('underlineLinks', !settings.underlineLinks);
  };

  const toggleReadableFont = () => {
    updateSetting('readableFont', !settings.readableFont);
  };

  const setReadingSpeed = (speed) => {
    updateSetting('readingSpeed', speed);
  };

  const startReading = async (text) => {
    if (!text || !text.trim()) {
      console.warn('No content to read');
      return;
    }

    try {
      await Speech.stop(); // Detener cualquier lectura anterior
      updateSetting('isReading', true);

      await Speech.speak(text, {
        language: 'es-ES',
        rate: settings.readingSpeed,
        onDone: () => updateSetting('isReading', false),
        onStopped: () => updateSetting('isReading', false),
        onError: (error) => {
          console.error('Speech error:', error);
          updateSetting('isReading', false);
        },
      });
    } catch (error) {
      console.error('Error starting speech:', error);
      updateSetting('isReading', false);
    }
  };

  const stopReading = async () => {
    try {
      await Speech.stop();
      updateSetting('isReading', false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  const resetAll = async () => {
    setSettings(DEFAULT_SETTINGS);
    await Speech.stop();
    try {
      await AsyncStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing accessibility settings:', error);
    }
  };

  // Función helper para escalar tamaños según fontSize
  const getScaledSize = (baseSize) => {
    return baseSize * settings.fontSize;
  };

  const value = {
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
    startReading,
    stopReading,
    resetAll,
    getScaledSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
