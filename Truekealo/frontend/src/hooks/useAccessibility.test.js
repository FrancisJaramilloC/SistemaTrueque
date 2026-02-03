/**
 * Test Suite para el Módulo de Accesibilidad Global
 * Validar todas las funcionalidades del hook useAccessibility
 */

import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '../hooks/useAccessibility';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAccessibility Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ========== TESTS INICIALES ==========
  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.fontSize).toBe(1);
      expect(result.current.settings.grayscale).toBe(false);
      expect(result.current.settings.highContrast).toBe(false);
      expect(result.current.settings.invertColors).toBe(false);
      expect(result.current.settings.lightBackground).toBe(false);
      expect(result.current.settings.underlineLinks).toBe(false);
      expect(result.current.settings.readableFont).toBe(false);
      expect(result.current.settings.readingSpeed).toBe(1);
      expect(result.current.settings.isReading).toBe(false);
    });

    test('should load saved settings from localStorage', () => {
      const savedSettings = {
        fontSize: 1.2,
        grayscale: true,
        highContrast: false,
        invertColors: false,
        lightBackground: true,
        underlineLinks: true,
        readableFont: false,
        readingSpeed: 1.5,
      };

      localStorage.setItem(
        'truekealo_accessibility_preferences',
        JSON.stringify(savedSettings)
      );

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.fontSize).toBe(1.2);
      expect(result.current.settings.grayscale).toBe(true);
      expect(result.current.settings.lightBackground).toBe(true);
      expect(result.current.settings.underlineLinks).toBe(true);
    });

    test('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('truekealo_accessibility_preferences', 'invalid json');

      const { result } = renderHook(() => useAccessibility());

      // Debería usar defaults si hay error
      expect(result.current.settings.fontSize).toBe(1);
      expect(result.current.settings.grayscale).toBe(false);
    });
  });

  // ========== TESTS DE TAMAÑO DE TEXTO ==========
  describe('Font Size Controls', () => {
    test('should increase font size', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.increaseFontSize();
      });

      expect(result.current.settings.fontSize).toBe(1.1);

      act(() => {
        result.current.increaseFontSize();
      });

      expect(result.current.settings.fontSize).toBe(1.2);
    });

    test('should not exceed maximum font size (1.5)', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        // Simular múltiples clics
        for (let i = 0; i < 10; i++) {
          result.current.increaseFontSize();
        }
      });

      expect(result.current.settings.fontSize).toBe(1.5);
    });

    test('should decrease font size', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.increaseFontSize();
        result.current.increaseFontSize();
      });

      expect(result.current.settings.fontSize).toBe(1.2);

      act(() => {
        result.current.decreaseFontSize();
      });

      expect(result.current.settings.fontSize).toBe(1.1);
    });

    test('should not go below minimum font size (0.8)', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.decreaseFontSize();
        }
      });

      expect(result.current.settings.fontSize).toBe(0.8);
    });
  });

  // ========== TESTS DE FILTROS DE COLOR ==========
  describe('Color and Contrast Filters', () => {
    test('should toggle grayscale on and off', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.grayscale).toBe(false);

      act(() => {
        result.current.toggleGrayscale();
      });

      expect(result.current.settings.grayscale).toBe(true);

      act(() => {
        result.current.toggleGrayscale();
      });

      expect(result.current.settings.grayscale).toBe(false);
    });

    test('should toggle high contrast on and off', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.highContrast).toBe(false);

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(result.current.settings.highContrast).toBe(true);
    });

    test('should toggle invert colors on and off', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.invertColors).toBe(false);

      act(() => {
        result.current.toggleInvertColors();
      });

      expect(result.current.settings.invertColors).toBe(true);
    });

    test('should toggle light background on and off', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.lightBackground).toBe(false);

      act(() => {
        result.current.toggleLightBackground();
      });

      expect(result.current.settings.lightBackground).toBe(true);
    });

    test('should allow multiple filters simultaneously', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleGrayscale();
        result.current.toggleHighContrast();
        result.current.toggleInvertColors();
      });

      expect(result.current.settings.grayscale).toBe(true);
      expect(result.current.settings.highContrast).toBe(true);
      expect(result.current.settings.invertColors).toBe(true);
    });
  });

  // ========== TESTS DE TIPOGRAFÍA ==========
  describe('Typography Controls', () => {
    test('should toggle underline links on and off', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.underlineLinks).toBe(false);

      act(() => {
        result.current.toggleUnderlineLinks();
      });

      expect(result.current.settings.underlineLinks).toBe(true);
    });

    test('should toggle readable font on and off', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.readableFont).toBe(false);

      act(() => {
        result.current.toggleReadableFont();
      });

      expect(result.current.settings.readableFont).toBe(true);
    });
  });

  // ========== TESTS DE LECTURA ==========
  describe('Reading Controls', () => {
    test('should set reading speed within valid range', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setReadingSpeed(1.5);
      });

      expect(result.current.settings.readingSpeed).toBe(1.5);

      act(() => {
        result.current.setReadingSpeed(0.7);
      });

      expect(result.current.settings.readingSpeed).toBe(0.7);
    });

    test('should have startReading and stopReading methods', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(typeof result.current.startReading).toBe('function');
      expect(typeof result.current.stopReading).toBe('function');
    });
  });

  // ========== TESTS DE PERSISTENCIA ==========
  describe('Persistence', () => {
    test('should persist settings to localStorage', async () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.increaseFontSize();
        result.current.toggleGrayscale();
      });

      // Esperar a que se persista
      await new Promise((resolve) => setTimeout(resolve, 100));

      const saved = JSON.parse(
        localStorage.getItem('truekealo_accessibility_preferences')
      );

      expect(saved.fontSize).toBe(1.1);
      expect(saved.grayscale).toBe(true);
    });

    test('should not persist transient fields', async () => {
      const { result } = renderHook(() => useAccessibility());

      // isReading no debería persistirse
      await new Promise((resolve) => setTimeout(resolve, 100));

      const saved = JSON.parse(
        localStorage.getItem('truekealo_accessibility_preferences')
      );

      expect(saved.isReading).toBeUndefined();
      expect(saved.speechSynthesis).toBeUndefined();
    });
  });

  // ========== TESTS DE RESET ==========
  describe('Reset Functionality', () => {
    test('should reset all settings to defaults', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.increaseFontSize();
        result.current.toggleGrayscale();
        result.current.toggleHighContrast();
        result.current.toggleInvertColors();
        result.current.toggleLightBackground();
        result.current.toggleUnderlineLinks();
        result.current.toggleReadableFont();
        result.current.setReadingSpeed(1.8);
      });

      act(() => {
        result.current.resetAll();
      });

      expect(result.current.settings.fontSize).toBe(1);
      expect(result.current.settings.grayscale).toBe(false);
      expect(result.current.settings.highContrast).toBe(false);
      expect(result.current.settings.invertColors).toBe(false);
      expect(result.current.settings.lightBackground).toBe(false);
      expect(result.current.settings.underlineLinks).toBe(false);
      expect(result.current.settings.readableFont).toBe(false);
      expect(result.current.settings.readingSpeed).toBe(1);
      expect(result.current.settings.isReading).toBe(false);
    });

    test('should clear localStorage on reset', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.increaseFontSize();
        result.current.toggleGrayscale();
      });

      act(() => {
        result.current.resetAll();
      });

      expect(
        localStorage.getItem('truekealo_accessibility_preferences')
      ).toBeNull();
    });
  });

  // ========== TESTS DE UPDATESETTING ==========
  describe('Generic Update Setting', () => {
    test('should update any setting via updateSetting', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateSetting('fontSize', 1.3);
      });

      expect(result.current.settings.fontSize).toBe(1.3);

      act(() => {
        result.current.updateSetting('grayscale', true);
      });

      expect(result.current.settings.grayscale).toBe(true);
    });
  });

  // ========== TESTS DE EDGE CASES ==========
  describe('Edge Cases', () => {
    test('should handle rapid changes smoothly', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.increaseFontSize();
        }
      });

      expect(result.current.settings.fontSize).toBe(1.5);
    });

    test('should maintain consistency with multiple settings', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.increaseFontSize();
        result.current.toggleGrayscale();
        result.current.toggleHighContrast();
        result.current.setReadingSpeed(1.2);
        result.current.toggleUnderlineLinks();
        result.current.toggleReadableFont();
      });

      const settings = result.current.settings;

      expect(settings.fontSize).toBe(1.1);
      expect(settings.grayscale).toBe(true);
      expect(settings.highContrast).toBe(true);
      expect(settings.readingSpeed).toBe(1.2);
      expect(settings.underlineLinks).toBe(true);
      expect(settings.readableFont).toBe(true);
    });
  });
});

/**
 * INSTRUCCIONES PARA EJECUTAR LOS TESTS:
 *
 * 1. Instala las dependencias de testing:
 *    npm install --save-dev @testing-library/react @testing-library/jest-dom
 *
 * 2. Crea un archivo jest.config.js en la raíz del proyecto:
 *    module.exports = {
 *      testEnvironment: 'jsdom',
 *      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
 *    };
 *
 * 3. Ejecuta los tests:
 *    npm test useAccessibility.test.js
 *
 * 4. Para ver cobertura:
 *    npm test -- --coverage useAccessibility.test.js
 */
