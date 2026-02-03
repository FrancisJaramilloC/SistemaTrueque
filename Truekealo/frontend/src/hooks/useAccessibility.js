import { useState, useEffect, useCallback, useRef } from 'react';

const ACCESSIBILITY_STORAGE_KEY = 'truekealo_accessibility_preferences';

const DEFAULT_SETTINGS = {
  fontSize: 1, // 0.9 to 1.4
  grayscale: false,
  highContrast: false,
  invertColors: false,
  lightBackground: false,
  underlineLinks: false,
  readableFont: false,
  readingSpeed: 1, // 0.5 to 2
  isReading: false,
  speechSynthesis: null,
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const utteranceRef = useRef(null);

  // Cargar preferencias al iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          isReading: false,
          speechSynthesis: null,
        }));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Guardar preferencias cuando cambien (excepto campos transitorios)
  useEffect(() => {
    if (!isInitialized) return;
    
    const { isReading, speechSynthesis, ...persistableSettings } = settings;
    localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(persistableSettings)
    );
  }, [settings, isInitialized]);

  // Aplicar estilos a través de CSS custom properties y DOM manipulations
  useEffect(() => {
    if (!isInitialized) return;
    applyAccessibilityStyles();
  }, [settings, isInitialized]);

  const applyAccessibilityStyles = () => {
    const root = document.documentElement;
    const body = document.body;

    // 1. Font size scaling - Aplicar globalmente al html
    root.style.setProperty('--a11y-font-scale', settings.fontSize);
    root.style.fontSize = `${settings.fontSize * 16}px`; // Base 16px escalado

    // 2. Construir array de filtros
    let filters = [];
    
    if (settings.grayscale) {
      filters.push('grayscale(100%)');
    }

    if (settings.highContrast) {
      filters.push('contrast(1.5) brightness(1.1)');
    }

    if (settings.invertColors) {
      filters.push('invert(1) hue-rotate(180deg)');
    }

    // Aplicar todos los filtros a html
    if (filters.length > 0) {
      document.documentElement.style.filter = filters.join(' ');
    } else {
      document.documentElement.style.filter = 'none';
    }

    // 3. Light background mode
    if (settings.lightBackground) {
      body.style.backgroundColor = 'var(--bg-light, #ffffff)';
      body.style.color = 'var(--text-light, #000000)';
      // Aplicar a tarjetas y contenedores
      document.querySelectorAll('.card, [class*="card"], [class*="container"]').forEach((el) => {
        el.style.backgroundColor = 'var(--card-light, #f5f5f5)';
        el.style.color = 'var(--text-light, #000000)';
      });
    } else {
      body.style.backgroundColor = '';
      body.style.color = '';
      document.querySelectorAll('.card, [class*="card"], [class*="container"]').forEach((el) => {
        el.style.backgroundColor = '';
        el.style.color = '';
      });
    }

    // 4. Underline links
    const linkStyle = settings.underlineLinks ? 'underline solid var(--primary, #d4742f)' : '';
    document.querySelectorAll('a').forEach((link) => {
      link.style.textDecoration = linkStyle || '';
    });

    // 5. Readable font
    if (settings.readableFont) {
      body.style.fontFamily =
        '"Arial", "Open Sans", "Trebuchet MS", sans-serif';
      body.style.letterSpacing = '0.05em';
      body.style.lineHeight = '1.8';
      body.style.fontWeight = '500';
    } else {
      body.style.fontFamily = '';
      body.style.letterSpacing = '';
      body.style.lineHeight = '';
      body.style.fontWeight = '';
    }

    // 6. Update CSS custom property for scale
    root.style.setProperty('--a11y-active', settings.highContrast || settings.invertColors ? '1' : '0');
  };

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const increaseFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 0.1, 1.4),
    }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 0.1, 0.9),
    }));
  }, []);

  const toggleGrayscale = useCallback(() => {
    updateSetting('grayscale', !settings.grayscale);
  }, [settings.grayscale, updateSetting]);

  const toggleHighContrast = useCallback(() => {
    updateSetting('highContrast', !settings.highContrast);
  }, [settings.highContrast, updateSetting]);

  const toggleInvertColors = useCallback(() => {
    updateSetting('invertColors', !settings.invertColors);
  }, [settings.invertColors, updateSetting]);

  const toggleLightBackground = useCallback(() => {
    updateSetting('lightBackground', !settings.lightBackground);
  }, [settings.lightBackground, updateSetting]);

  const toggleUnderlineLinks = useCallback(() => {
    updateSetting('underlineLinks', !settings.underlineLinks);
  }, [settings.underlineLinks, updateSetting]);

  const toggleReadableFont = useCallback(() => {
    updateSetting('readableFont', !settings.readableFont);
  }, [settings.readableFont, updateSetting]);

  const setReadingSpeed = useCallback((speed) => {
    updateSetting('readingSpeed', speed);
    // Si está leyendo, actualizar también la velocidad del utterance actual
    if (utteranceRef.current && window.speechSynthesis.speaking) {
      utteranceRef.current.rate = speed;
    }
  }, [updateSetting]);

  const startReading = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    const text = mainContent.innerText;

    if (!text.trim()) {
      console.warn('No content to read');
      return;
    }

    if ('speechSynthesis' in window) {
      // Cancelar lectura anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.readingSpeed;
      
      // Detectar idioma del documento
      const lang = document.documentElement.lang || 'es-ES';
      utterance.lang = lang;

      utterance.onstart = () => {
        updateSetting('isReading', true);
      };

      utterance.onend = () => {
        updateSetting('isReading', false);
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        updateSetting('isReading', false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis API not supported in this browser');
    }
  }, [settings.readingSpeed, updateSetting]);

  const stopReading = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      updateSetting('isReading', false);
      utteranceRef.current = null;
    }
  }, [updateSetting]);

  const resetAll = useCallback(() => {
    // Reset states
    setSettings(DEFAULT_SETTINGS);

    // Cancel speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Clear storage
    localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    
    // Reset estilos globales explícitamente
    const root = document.documentElement;
    root.style.setProperty('--a11y-font-scale', '1');
    root.style.fontSize = '16px';
    root.style.filter = 'none';
    
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    document.body.style.fontFamily = '';
    document.body.style.letterSpacing = '';
    document.body.style.lineHeight = '';
    document.body.style.fontWeight = '';
    
    // Limpiar estilos de enlaces
    document.querySelectorAll('a').forEach((link) => {
      link.style.textDecoration = '';
    });
    
    utteranceRef.current = null;
  }, []);

  return {
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
    updateSetting,
  };
};
