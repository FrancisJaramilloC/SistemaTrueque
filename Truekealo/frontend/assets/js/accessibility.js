/**
 * SISTEMA DE ACCESIBILIDAD
 * Controla todas las herramientas de accesibilidad del sitio
 */

console.log('[A11y] Accessibility.js loaded');

class AccessibilityManager {
    constructor() {
        console.log('[A11y] Initializing AccessibilityManager');
        this.settings = this.loadSettings();
        this.speechUtterance = null;
        this.isSpeaking = false;
        this.init();
    }

    init() {
        console.log('[A11y] init() called');
        this.cacheElements();
        console.log('[A11y] Elements cached:', {
            toggle: this.toggle,
            panel: this.panel,
            closeBtn: this.closeBtn
        });
        this.attachEventListeners();
        console.log('[A11y] Event listeners attached');
        this.applyStoredSettings();
        this.setupTextSizeObserver();
        console.log('[A11y] AccessibilityManager fully initialized');
    }

    /**
     * Almacena referencias a elementos del DOM
     */
    cacheElements() {
        this.toggle = document.getElementById('accessibility-toggle');
        this.panel = document.getElementById('accessibility-panel');
        this.closeBtn = document.getElementById('accessibility-close');

        // Botones de tamaño de texto
        this.textIncreaseBtn = document.getElementById('text-increase');
        this.textDecreaseBtn = document.getElementById('text-decrease');
        this.currentTextSizeDisplay = document.getElementById('current-text-size');

        // Botones de contraste y colores
        this.grayscaleToggle = document.getElementById('grayscale-toggle');
        this.highContrastToggle = document.getElementById('high-contrast-toggle');
        this.negativeContrastToggle = document.getElementById('negative-contrast-toggle');

        // Botones de fondo
        this.lightBackgroundToggle = document.getElementById('light-background-toggle');

        // Botones de enlaces
        this.underlineLinksToggle = document.getElementById('underline-links-toggle');

        // Botones de fuente
        this.readableFontToggle = document.getElementById('readable-font-toggle');

        // Botones de lectura
        this.readPageBtn = document.getElementById('read-page-btn');
        this.stopReadingBtn = document.getElementById('stop-reading-btn');
        this.speechRateSlider = document.getElementById('speech-rate');
        this.speechRateDisplay = document.getElementById('speech-rate-display');

        // Botón de restablecer
        this.resetBtn = document.getElementById('reset-settings');
    }

    /**
     * Vincula los eventos a los elementos
     */
    attachEventListeners() {
        // Toggle del menú
        this.toggle.addEventListener('click', () => this.toggleMenu());
        this.closeBtn.addEventListener('click', () => this.closeMenu());

        // Tamaño de texto
        this.textIncreaseBtn.addEventListener('click', () => this.increaseTextSize());
        this.textDecreaseBtn.addEventListener('click', () => this.decreaseTextSize());

        // Contraste y colores
        this.grayscaleToggle.addEventListener('click', () => this.toggleGrayscale());
        this.highContrastToggle.addEventListener('click', () => this.toggleHighContrast());
        this.negativeContrastToggle.addEventListener('click', () => this.toggleNegativeContrast());

        // Fondo
        this.lightBackgroundToggle.addEventListener('click', () => this.toggleLightBackground());

        // Enlaces
        this.underlineLinksToggle.addEventListener('click', () => this.toggleUnderlineLinks());

        // Fuente
        this.readableFontToggle.addEventListener('click', () => this.toggleReadableFont());

        // Lectura
        this.readPageBtn.addEventListener('click', () => this.readPage());
        this.stopReadingBtn.addEventListener('click', () => this.stopReading());
        this.speechRateSlider.addEventListener('input', (e) => this.updateSpeechRate(e.target.value));

        // Restablecer
        this.resetBtn.addEventListener('click', () => this.resetSettings());

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.toggle.contains(e.target) && !this.panel.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Cerrar menú con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });
    }

    /**
     * MENÚ - Alterna la visualización del panel
     */
    toggleMenu() {
        console.log('[A11y] toggleMenu() called, current state:', this.panel.hidden);
        if (this.panel.hidden) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        console.log('[A11y] openMenu() called');
        this.panel.hidden = false;
        this.toggle.setAttribute('aria-expanded', 'true');
        console.log('[A11y] Panel hidden set to:', this.panel.hidden);
        this.updateButtonStates();
    }

    closeMenu() {
        console.log('[A11y] closeMenu() called');
        this.panel.hidden = true;
        this.toggle.setAttribute('aria-expanded', 'false');
    }

    /**
     * TAMAÑO DE TEXTO
     */
    increaseTextSize() {
        let currentSize = this.settings.textSize || 100;
        if (currentSize < 200) {
            currentSize += 25;
            this.setTextSize(currentSize);
        }
    }

    decreaseTextSize() {
        let currentSize = this.settings.textSize || 100;
        if (currentSize > 75) {
            currentSize -= 25;
            this.setTextSize(currentSize);
        }
    }

    setTextSize(size) {
        this.settings.textSize = size;
        this.applyTextSize();
        this.saveSettings();
        this.updateTextSizeDisplay();
    }

    applyTextSize() {
        const size = this.settings.textSize || 100;
        const body = document.body;

        // Remover clases anteriores
        body.classList.remove(
            'a11y-text-75',
            'a11y-text-125',
            'a11y-text-150',
            'a11y-text-175',
            'a11y-text-200'
        );

        // Aplicar nueva clase
        if (size !== 100) {
            body.classList.add(`a11y-text-${size}`);
        }
    }

    updateTextSizeDisplay() {
        const size = this.settings.textSize || 100;
        this.currentTextSizeDisplay.textContent = `${size}%`;
    }

    /**
     * ESCALA DE GRISES
     */
    toggleGrayscale() {
        this.settings.grayscale = !this.settings.grayscale;
        this.applyGrayscale();
        this.saveSettings();
    }

    applyGrayscale() {
        if (this.settings.grayscale) {
            document.body.classList.add('a11y-grayscale');
            this.grayscaleToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('a11y-grayscale');
            this.grayscaleToggle.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * ALTO CONTRASTE
     */
    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.applyHighContrast();
        this.saveSettings();
    }

    applyHighContrast() {
        if (this.settings.highContrast) {
            document.body.classList.add('a11y-high-contrast');
            this.highContrastToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('a11y-high-contrast');
            this.highContrastToggle.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * CONTRASTE NEGATIVO
     */
    toggleNegativeContrast() {
        this.settings.negativeContrast = !this.settings.negativeContrast;
        this.applyNegativeContrast();
        this.saveSettings();
    }

    applyNegativeContrast() {
        if (this.settings.negativeContrast) {
            document.body.classList.add('a11y-negative-contrast');
            this.negativeContrastToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('a11y-negative-contrast');
            this.negativeContrastToggle.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * FONDO CLARO
     */
    toggleLightBackground() {
        this.settings.lightBackground = !this.settings.lightBackground;
        this.applyLightBackground();
        this.saveSettings();
    }

    applyLightBackground() {
        if (this.settings.lightBackground) {
            document.body.classList.add('a11y-light-background');
            this.lightBackgroundToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('a11y-light-background');
            this.lightBackgroundToggle.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * ENLACES SUBRAYADOS
     */
    toggleUnderlineLinks() {
        this.settings.underlineLinks = !this.settings.underlineLinks;
        this.applyUnderlineLinks();
        this.saveSettings();
    }

    applyUnderlineLinks() {
        if (this.settings.underlineLinks) {
            document.body.classList.add('a11y-underline-links');
            this.underlineLinksToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('a11y-underline-links');
            this.underlineLinksToggle.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * FUENTE LEGIBLE
     */
    toggleReadableFont() {
        this.settings.readableFont = !this.settings.readableFont;
        this.applyReadableFont();
        this.saveSettings();
    }

    applyReadableFont() {
        if (this.settings.readableFont) {
            document.body.classList.add('a11y-readable-font');
            this.readableFontToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('a11y-readable-font');
            this.readableFontToggle.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * LECTURA EN VOZ ALTA
     */
    readPage() {
        if (this.isSpeaking) {
            this.stopReading();
            return;
        }

        // Obtener el texto del cuerpo del documento
        const textToRead = this.getPageText();

        if (!textToRead.trim()) {
            alert('No hay contenido para leer en esta página.');
            return;
        }

        this.speechUtterance = new SpeechSynthesisUtterance(textToRead);
        this.speechUtterance.rate = parseFloat(this.speechRateSlider.value);
        this.speechUtterance.pitch = 1;
        this.speechUtterance.volume = 1;

        // Usar idioma del documento si está disponible
        const lang = document.documentElement.lang || 'es-ES';
        this.speechUtterance.lang = lang;

        // Eventos
        this.speechUtterance.onstart = () => {
            this.isSpeaking = true;
            this.updateReadingButtons();
        };

        this.speechUtterance.onend = () => {
            this.isSpeaking = false;
            this.updateReadingButtons();
        };

        this.speechUtterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
            this.isSpeaking = false;
            this.updateReadingButtons();
        };

        // Iniciar lectura
        speechSynthesis.cancel();
        speechSynthesis.speak(this.speechUtterance);
    }

    stopReading() {
        speechSynthesis.cancel();
        this.isSpeaking = false;
        this.updateReadingButtons();
    }

    getPageText() {
        // Excluir elementos específicos
        const clone = document.body.cloneNode(true);

        // Remover scripts, estilos, y otros elementos no visibles
        const elementsToRemove = clone.querySelectorAll(
            'script, style, noscript, .accessibility-menu, [aria-hidden="true"]'
        );
        elementsToRemove.forEach(el => el.remove());

        return clone.innerText;
    }

    updateSpeechRate(rate) {
        rate = parseFloat(rate);
        this.settings.speechRate = rate;
        this.speechRateDisplay.textContent = rate.toFixed(1) + 'x';

        // Si está leyendo, actualizar velocidad
        if (this.isSpeaking && this.speechUtterance) {
            speechSynthesis.cancel();
            this.speechUtterance.rate = rate;
            speechSynthesis.speak(this.speechUtterance);
        }

        this.saveSettings();
    }

    updateReadingButtons() {
        if (this.isSpeaking) {
            this.readPageBtn.disabled = true;
            this.stopReadingBtn.disabled = false;
            this.readPageBtn.setAttribute('aria-label', 'Leyendo página...');
        } else {
            this.readPageBtn.disabled = false;
            this.stopReadingBtn.disabled = true;
            this.readPageBtn.setAttribute('aria-label', 'Leer página en voz alta');
        }
    }

    /**
     * RESTABLECER CONFIGURACIÓN
     */
    resetSettings() {
        if (confirm('¿Estás seguro de que deseas restablecer todos los cambios de accesibilidad?')) {
            this.settings = {
                textSize: 100,
                grayscale: false,
                highContrast: false,
                negativeContrast: false,
                lightBackground: false,
                underlineLinks: false,
                readableFont: false,
                speechRate: 1
            };

            // Limpiar ajustes de voz
            this.stopReading();

            // Aplicar cambios
            this.applyAllSettings();
            this.saveSettings();
            this.updateTextSizeDisplay();

            // Mostrar confirmación
            alert('Los cambios de accesibilidad han sido restablecidos.');
        }
    }

    /**
     * PERSISTENCIA - localStorage
     */
    loadSettings() {
        const stored = localStorage.getItem('a11y-settings');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error al cargar configuración de accesibilidad:', e);
            }
        }
        return this.getDefaultSettings();
    }

    saveSettings() {
        try {
            localStorage.setItem('a11y-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error al guardar configuración de accesibilidad:', e);
        }
    }

    getDefaultSettings() {
        return {
            textSize: 100,
            grayscale: false,
            highContrast: false,
            negativeContrast: false,
            lightBackground: false,
            underlineLinks: false,
            readableFont: false,
            speechRate: 1
        };
    }

    /**
     * Aplica todos los ajustes guardados
     */
    applyStoredSettings() {
        this.applyTextSize();
        this.updateTextSizeDisplay();
        this.applyGrayscale();
        this.applyHighContrast();
        this.applyNegativeContrast();
        this.applyLightBackground();
        this.applyUnderlineLinks();
        this.applyReadableFont();
        
        if (this.speechRateSlider) {
            this.speechRateSlider.value = this.settings.speechRate || 1;
        }
        this.updateSpeechRate(this.settings.speechRate || 1);
    }

    /**
     * Aplica todos los ajustes (usado en reset)
     */
    applyAllSettings() {
        this.applyTextSize();
        this.applyGrayscale();
        this.applyHighContrast();
        this.applyNegativeContrast();
        this.applyLightBackground();
        this.applyUnderlineLinks();
        this.applyReadableFont();
    }

    /**
     * Actualiza el estado visual de los botones
     */
    updateButtonStates() {
        this.grayscaleToggle.setAttribute('aria-pressed', this.settings.grayscale ? 'true' : 'false');
        this.highContrastToggle.setAttribute('aria-pressed', this.settings.highContrast ? 'true' : 'false');
        this.negativeContrastToggle.setAttribute('aria-pressed', this.settings.negativeContrast ? 'true' : 'false');
        this.lightBackgroundToggle.setAttribute('aria-pressed', this.settings.lightBackground ? 'true' : 'false');
        this.underlineLinksToggle.setAttribute('aria-pressed', this.settings.underlineLinks ? 'true' : 'false');
        this.readableFontToggle.setAttribute('aria-pressed', this.settings.readableFont ? 'true' : 'false');
    }

    /**
     * Observador para cambios en el DOM
     */
    setupTextSizeObserver() {
        // Revalidar tamaño de texto si el DOM cambia
        const observer = new MutationObserver(() => {
            if (this.settings.textSize && this.settings.textSize !== 100) {
                this.applyTextSize();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

/**
 * Inicializar el gestor de accesibilidad cuando el DOM esté listo
 */
console.log('[A11y] Script registered DOMContentLoaded listener');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[A11y] DOMContentLoaded fired');
    if (!window.accessibilityManager) {
        console.log('[A11y] Creating new AccessibilityManager instance');
        window.accessibilityManager = new AccessibilityManager();
    } else {
        console.log('[A11y] AccessibilityManager already exists');
    }
});

// También inicializar si el script se carga después del DOMContentLoaded
console.log('[A11y] document.readyState:', document.readyState);

if (document.readyState === 'loading') {
    console.log('[A11y] Document is still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[A11y] DOMContentLoaded fired (fallback)');
        if (!window.accessibilityManager) {
            window.accessibilityManager = new AccessibilityManager();
        }
    });
} else {
    console.log('[A11y] Document already loaded, initializing immediately');
    if (!window.accessibilityManager) {
        window.accessibilityManager = new AccessibilityManager();
    }
}
