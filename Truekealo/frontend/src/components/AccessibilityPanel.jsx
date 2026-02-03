import React, { useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/AccessibilityPanel.css';

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
    startReading,
    stopReading,
    resetAll,
  } = useAccessibility();

  // Mapear fontSize (0.9 - 1.4) a escala 0-100
  const fontSizeDisplay = Math.round(((settings.fontSize - 0.9) / 0.5) * 100);
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
    <div className="accessibility-container">
      {/* Botón flotante - Indicador visual de estado */}
      <button
        className={`accessibility-toggle ${isOpen ? 'open' : ''} ${hasActiveSettings ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir panel de accesibilidad"
        title="Opciones de accesibilidad"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="a11y-icon"
        >
          {/* Icono de accesibilidad (persona con brazos abiertos) */}
          <circle cx="12" cy="6" r="3" />
          <path d="M12 9v2m0 4v5M9 15h6m-6-3h6" />
        </svg>
        {hasActiveSettings && <span className="a11y-indicator"></span>}
      </button>

      {/* Panel principal */}
      <div className={`accessibility-panel ${isOpen ? 'open' : ''}`}>
        <div className="accessibility-header">
          <h2>♿ Accesibilidad</h2>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar panel"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="accessibility-content">
          {/* Sección: Tamaño de texto */}
          <div className="a11y-section">
            <h3>📝 Tamaño de Texto</h3>
            <div className="control-group">
              <button
                className="btn-control decrease"
                onClick={decreaseFontSize}
                disabled={settings.fontSize <= 0.9}
                title="Reducir tamaño (Mín: 90%)"
                aria-label="Reducir tamaño de texto"
              >
                A−
              </button>
              <span className="font-size-display" aria-live="polite">
                {fontSizeDisplay}
              </span>
              <button
                className="btn-control increase"
                onClick={increaseFontSize}
                disabled={settings.fontSize >= 1.4}
                title="Aumentar tamaño (Máx: 140%)"
                aria-label="Aumentar tamaño de texto"
              >
                A+
              </button>
            </div>
          </div>

          {/* Sección: Contraste y Colores */}
          <div className="a11y-section">
            <h3>🎨 Contraste y Colores</h3>

            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={settings.grayscale}
                onChange={toggleGrayscale}
                aria-label="Activar escala de grises"
              />
              <span>Escala de grises</span>
            </label>

            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={toggleHighContrast}
                aria-label="Activar alto contraste"
              />
              <span>Alto contraste</span>
            </label>

            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={settings.invertColors}
                onChange={toggleInvertColors}
                aria-label="Activar inversión de colores"
              />
              <span>Invertir colores</span>
            </label>

            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={settings.lightBackground}
                onChange={toggleLightBackground}
                aria-label="Activar fondo claro"
              />
              <span>Fondo claro</span>
            </label>
          </div>

          {/* Sección: Enlaces y Fuentes */}
          <div className="a11y-section">
            <h3>🔤 Enlaces y Fuentes</h3>

            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={settings.underlineLinks}
                onChange={toggleUnderlineLinks}
                aria-label="Activar subrayado de enlaces"
              />
              <span>Subrayar enlaces</span>
            </label>

            <label className="checkbox-control">
              <input
                type="checkbox"
                checked={settings.readableFont}
                onChange={toggleReadableFont}
                aria-label="Activar fuente legible"
              />
              <span>Fuente legible</span>
            </label>
          </div>

          {/* Sección: Lectura */}
          <div className="a11y-section">
            <h3>🔊 Lectura</h3>

            <div className="speed-control">
              <label htmlFor="reading-speed">Velocidad:</label>
              <div className="speed-input">
                <input
                  id="reading-speed"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.readingSpeed}
                  onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                  disabled={!settings.isReading}
                  aria-label="Control de velocidad de lectura"
                />
                <span className="speed-value" aria-live="polite">
                  {settings.readingSpeed.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="button-group">
              <button
                className={`btn-action ${settings.isReading ? 'active' : ''}`}
                onClick={startReading}
                disabled={settings.isReading}
                title="Leer contenido principal en voz alta"
                aria-label="Iniciar lectura en voz alta"
              >
                🔊 Leer
              </button>
              <button
                className="btn-action danger"
                onClick={stopReading}
                disabled={!settings.isReading}
                title="Detener lectura en voz alta"
                aria-label="Detener lectura"
              >
                ⏹ Detener
              </button>
            </div>
          </div>

          {/* Sección: Restablecer */}
          <div className="a11y-section">
            <button
              className="btn-reset"
              onClick={resetAll}
              title="Revierte todos los cambios de accesibilidad a valores predeterminados"
              aria-label="Restablecer cambios de accesibilidad"
            >
              ↻ Restablecer cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;
