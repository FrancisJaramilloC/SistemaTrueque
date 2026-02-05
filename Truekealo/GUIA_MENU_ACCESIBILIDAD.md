# Guía de Diseño e Implementación - Menú de Accesibilidad

## 📋 Índice
1. [Análisis de Requisitos](#análisis-de-requisitos)
2. [Opciones del Menú](#opciones-del-menú)
3. [Arquitectura y Comportamiento](#arquitectura-y-comportamiento)
4. [Estándares WCAG y WAI-ARIA](#estándares-wcag-y-wai-aria)
5. [Implementación Técnica](#implementación-técnica)
6. [Buenas Prácticas](#buenas-prácticas)

---

## 🎯 Análisis de Requisitos

### Objetivos
- **Inclusividad**: Permitir que usuarios con diferentes capacidades accedan al sistema
- **Rendimiento**: Implementación ligera sin impacto en velocidad de carga
- **UX**: Controles intuitivos y no intrusivos
- **Persistencia**: Preferencias guardadas entre sesiones

### Usuarios Objetivo
- Personas con discapacidad visual (baja visión, daltonismo)
- Personas con discapacidad motriz (navegación por teclado)
- Usuarios con dificultades cognitivas (necesitan texto grande)
- Usuarios de lectores de pantalla (NVDA, JAWS, VoiceOver)
- Usuarios con sensibilidad a la luz (prefieren modo oscuro)

---

## 🎨 Opciones del Menú

### 1. Tamaño de Texto
**Propósito**: Ajustar el tamaño de la fuente para mejorar legibilidad

**Opciones:**
- **Pequeño**: 14px (base × 0.875)
- **Normal**: 16px (base, por defecto)
- **Grande**: 18px (base × 1.125)
- **Muy Grande**: 20px (base × 1.25)
- **Extra Grande**: 24px (base × 1.5)

**Implementación:**
```css
:root {
    --font-size-base: 16px;
}

body.text-small { --font-size-base: 14px; }
body.text-normal { --font-size-base: 16px; }
body.text-large { --font-size-base: 18px; }
body.text-xlarge { --font-size-base: 20px; }
body.text-xxlarge { --font-size-base: 24px; }

body {
    font-size: var(--font-size-base);
}
```

**Estándar WCAG:**
- ✅ Criterio 1.4.4 (AA): Texto redimensionable hasta 200%
- ✅ Criterio 1.4.8 (AAA): Sin pérdida de contenido o funcionalidad

---

### 2. Contraste de Color
**Propósito**: Mejorar visibilidad para usuarios con baja visión o daltonismo

**Opciones:**
- **Normal**: Contraste 4.5:1 (WCAG AA)
- **Alto Contraste**: Contraste 7:1 (WCAG AAA)
- **Modo Daltonismo**: Paleta amigable para protanopia y deuteranopia

**Implementación:**
```css
/* Normal (por defecto) */
:root {
    --color-text: #1f2937;      /* gray-800 */
    --color-bg: #ffffff;
    --color-primary: #3b82f6;   /* blue-500 */
}

/* Alto Contraste */
body.high-contrast {
    --color-text: #000000;
    --color-bg: #ffffff;
    --color-primary: #0000ff;
    --color-link: #0000ee;
}

/* Daltonismo */
body.colorblind-safe {
    --color-success: #0077bb;   /* Azul en lugar de verde */
    --color-warning: #ee7733;   /* Naranja en lugar de amarillo */
    --color-error: #cc3311;     /* Rojo oscuro */
    --color-info: #33bbee;      /* Cian */
}
```

**Estándar WCAG:**
- ✅ Criterio 1.4.3 (AA): Contraste mínimo 4.5:1 para texto normal
- ✅ Criterio 1.4.6 (AAA): Contraste mínimo 7:1 para texto normal
- ✅ Criterio 1.4.11 (AA): Contraste 3:1 para componentes UI

---

### 3. Modo Oscuro
**Propósito**: Reducir fatiga visual y mejorar experiencia en ambientes con poca luz

**Opciones:**
- **Modo Claro**: Fondo blanco, texto oscuro (por defecto)
- **Modo Oscuro**: Fondo oscuro, texto claro
- **Automático**: Sincronizado con preferencia del sistema operativo

**Implementación:**
```css
/* Modo Claro (por defecto) */
:root {
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f3f4f6;
    --color-text-primary: #1f2937;
    --color-text-secondary: #6b7280;
}

/* Modo Oscuro */
body.dark-mode {
    --color-bg-primary: #1f2937;
    --color-bg-secondary: #111827;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #d1d5db;
}

/* Detección automática */
@media (prefers-color-scheme: dark) {
    body.dark-auto {
        --color-bg-primary: #1f2937;
        --color-text-primary: #f9fafb;
    }
}
```

**Estándar WCAG:**
- ✅ Criterio 1.4.3 (AA): Mantener contraste adecuado en modo oscuro
- ✅ Beneficio adicional: Reduce consumo de energía en pantallas OLED

---

### 4. Navegación por Teclado
**Propósito**: Permitir navegación completa sin mouse

**Opciones:**
- **Indicadores de Foco Mejorados**: Bordes visibles al navegar con Tab
- **Skip Links**: Enlaces para saltar al contenido principal
- **Atajos de Teclado**: Combinaciones personalizadas

**Implementación:**
```css
/* Foco visible mejorado */
:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
}

/* Skip link (visible solo con teclado) */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

**JavaScript:**
```javascript
// Atajos de teclado
document.addEventListener('keydown', (e) => {
    // Alt + M: Abrir menú accesibilidad
    if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleAccessibilityMenu();
    }
    
    // Alt + 1-5: Navegar secciones principales
    if (e.altKey && /[1-5]/.test(e.key)) {
        e.preventDefault();
        navigateToSection(parseInt(e.key));
    }
});
```

**Estándar WCAG:**
- ✅ Criterio 2.1.1 (A): Funcionalidad disponible por teclado
- ✅ Criterio 2.4.7 (AA): Indicador de foco visible
- ✅ Criterio 2.1.4 (A): Atajos de teclado de una sola tecla evitables

---

### 5. Lector de Pantalla
**Propósito**: Optimizar experiencia para usuarios con discapacidad visual severa

**Opciones:**
- **Modo Lector de Pantalla Optimizado**: Simplifica UI, aumenta semántica
- **Anuncios ARIA Live**: Notificaciones de cambios dinámicos
- **Descripciones Extendidas**: Texto alternativo detallado para imágenes

**Implementación HTML:**
```html
<!-- Región principal con landmark -->
<main role="main" aria-label="Contenido principal">
    <!-- Encabezado de sección -->
    <h1 id="page-title">Mis Artículos</h1>
    
    <!-- Navegación breadcrumb -->
    <nav aria-label="Breadcrumb">
        <ol>
            <li><a href="/">Inicio</a></li>
            <li aria-current="page">Mis Artículos</li>
        </ol>
    </nav>
    
    <!-- Región live para notificaciones -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
        <!-- Anuncios dinámicos aquí -->
    </div>
    
    <!-- Botón con estado -->
    <button 
        aria-pressed="false"
        aria-label="Activar modo oscuro"
        aria-describedby="dark-mode-desc">
        <span aria-hidden="true">🌙</span>
        Modo Oscuro
    </button>
    <span id="dark-mode-desc" class="sr-only">
        Cambia la interfaz a colores oscuros para reducir fatiga visual
    </span>
</main>
```

**CSS para Lectores de Pantalla:**
```css
/* Clase para contenido solo visible para screen readers */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

/* Pero visible cuando recibe foco */
.sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
}
```

**Estándar WCAG:**
- ✅ Criterio 1.1.1 (A): Contenido no textual tiene alternativas
- ✅ Criterio 1.3.1 (A): Información y relaciones programáticamente determinables
- ✅ Criterio 4.1.2 (A): Nombre, función y valor disponibles para tecnologías asistivas
- ✅ Criterio 4.1.3 (AA): Mensajes de estado programáticamente determinables

---

## 🏗️ Arquitectura y Comportamiento

### Estructura del Menú

```
┌─────────────────────────────────┐
│  [A] Botón Flotante             │  ← Siempre visible
│      (icono accesibilidad)      │     Posición fija
└─────────────────────────────────┘
              │
              │ (click/Enter)
              ▼
┌─────────────────────────────────┐
│  Panel de Accesibilidad         │  ← Modal/Slide panel
│  ┌───────────────────────────┐  │
│  │ 🔤 Tamaño de Texto        │  │
│  │ [ - ] [ + ] Reset         │  │
│  ├───────────────────────────┤  │
│  │ 🎨 Contraste              │  │
│  │ (•) Normal  ( ) Alto      │  │
│  ├───────────────────────────┤  │
│  │ 🌙 Tema                   │  │
│  │ [Claro] [Oscuro] [Auto]   │  │
│  ├───────────────────────────┤  │
│  │ ⌨️  Navegación Teclado     │  │
│  │ [✓] Indicadores visibles  │  │
│  ├───────────────────────────┤  │
│  │ 🔊 Lector de Pantalla     │  │
│  │ [✓] Optimizado para SR    │  │
│  └───────────────────────────┘  │
│  [Guardar] [Restablecer]        │
└─────────────────────────────────┘
```

### Principios de Comportamiento

#### 1. **No Intrusivo**
- Botón flotante pequeño (48×48px, tamaño táctil mínimo)
- Posición: esquina inferior derecha
- z-index alto pero no bloquea contenido crítico
- Animación sutil al abrir/cerrar (200-300ms)

#### 2. **Persistencia**
```javascript
// Guardar preferencias en localStorage
const AccessibilityManager = {
    save() {
        const prefs = {
            fontSize: document.body.dataset.fontSize || 'normal',
            contrast: document.body.dataset.contrast || 'normal',
            theme: document.body.dataset.theme || 'light',
            keyboardNav: this.keyboardNavEnabled,
            screenReader: this.screenReaderMode,
            timestamp: Date.now()
        };
        localStorage.setItem('accessibility_prefs', JSON.stringify(prefs));
    },
    
    load() {
        const saved = localStorage.getItem('accessibility_prefs');
        if (!saved) return;
        
        const prefs = JSON.parse(saved);
        // Aplicar preferencias guardadas
        this.applyFontSize(prefs.fontSize);
        this.applyContrast(prefs.contrast);
        this.applyTheme(prefs.theme);
    }
};

// Cargar al inicio
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityManager.load();
});
```

#### 3. **Rendimiento Optimizado**
- **CSS variables** para cambios instantáneos (no re-render)
- **Lazy loading** del panel (solo carga cuando se abre)
- **Debouncing** en ajustes que requieren recálculo
- **Prefiere CSS sobre JS** para animaciones

```javascript
// Debounce para cambios de tamaño
let resizeTimer;
function handleFontSizeChange(newSize) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.style.setProperty('--font-size-base', newSize + 'px');
        // Recalcular layouts si es necesario
        requestAnimationFrame(() => {
            // Ajustes de layout
        });
    }, 150);
}
```

#### 4. **Feedback Inmediato**
- Cambios visibles instantáneamente
- Anuncio ARIA para lectores de pantalla
- Animación sutil en controles

```javascript
function announceChange(message) {
    const liveRegion = document.getElementById('a11y-announcer');
    liveRegion.textContent = ''; // Limpiar
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

// Ejemplo de uso
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    announceChange('Modo oscuro activado');
}
```

---

## 📐 Estándares WCAG y WAI-ARIA

### WCAG 2.1 - Niveles de Conformidad

#### Nivel A (Mínimo)
- ✅ **1.1.1** Contenido No Textual: Todas las imágenes tienen alt
- ✅ **1.3.1** Información y Relaciones: HTML semántico
- ✅ **2.1.1** Teclado: Funcionalidad accesible por teclado
- ✅ **2.1.2** Sin Trampa de Teclado: Tab puede salir de todos los controles
- ✅ **2.4.1** Saltar Bloques: Skip links implementados
- ✅ **4.1.1** Análisis: HTML válido
- ✅ **4.1.2** Nombre, Función, Valor: Atributos ARIA correctos

#### Nivel AA (Recomendado)
- ✅ **1.4.3** Contraste Mínimo: 4.5:1 para texto normal
- ✅ **1.4.4** Redimensionar Texto: Hasta 200% sin pérdida de contenido
- ✅ **1.4.5** Imágenes de Texto: Evitadas excepto logotipos
- ✅ **2.4.7** Foco Visible: Indicadores siempre visibles
- ✅ **3.2.3** Navegación Consistente: Menú en misma posición
- ✅ **4.1.3** Mensajes de Estado: ARIA live regions

#### Nivel AAA (Excelencia)
- ⭐ **1.4.6** Contraste Mejorado: 7:1 para texto normal
- ⭐ **1.4.8** Presentación Visual: Ajuste de interlineado y espaciado
- ⭐ **2.4.8** Ubicación: Breadcrumbs implementados
- ⭐ **3.2.5** Cambio a Solicitud: Sin cambios automáticos de contexto

### WAI-ARIA 1.2 - Roles y Propiedades

#### Roles de Landmark
```html
<header role="banner"><!-- Cabecera principal --></header>
<nav role="navigation" aria-label="Principal"><!-- Navegación --></nav>
<main role="main"><!-- Contenido principal --></main>
<aside role="complementary"><!-- Contenido relacionado --></aside>
<footer role="contentinfo"><!-- Pie de página --></footer>
```

#### Roles de Widget
```html
<!-- Botón de alternancia -->
<button 
    role="switch" 
    aria-checked="false"
    aria-label="Modo oscuro">
    <span aria-hidden="true">🌙</span>
</button>

<!-- Panel colapsable -->
<div role="region" aria-labelledby="settings-title" aria-expanded="false">
    <h3 id="settings-title">Configuración</h3>
    <!-- Contenido -->
</div>

<!-- Tabs -->
<div role="tablist" aria-label="Opciones de accesibilidad">
    <button role="tab" aria-selected="true" aria-controls="panel-1">
        Visual
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-2">
        Navegación
    </button>
</div>
```

#### Estados y Propiedades
```html
<!-- Elemento deshabilitado -->
<button aria-disabled="true">Guardar</button>

<!-- Elemento requerido -->
<input aria-required="true" aria-invalid="false">

<!-- Descripción extendida -->
<button aria-describedby="help-text">Ayuda</button>
<span id="help-text" class="sr-only">
    Haz clic para abrir el centro de ayuda
</span>

<!-- Elemento cargando -->
<div aria-busy="true" aria-live="polite">
    Cargando artículos...
</div>
```

---

## 💻 Implementación Técnica

### Estructura de Archivos
```
frontend/
├── assets/
│   ├── css/
│   │   ├── accessibility.css         ← Estilos del menú
│   │   └── themes/
│   │       ├── dark-mode.css
│   │       ├── high-contrast.css
│   │       └── colorblind-safe.css
│   ├── js/
│   │   └── accessibility-manager.js  ← Lógica de accesibilidad
│   └── icons/
│       └── accessibility-icons.svg   ← Iconos del menú
└── includes/
    └── accessibility-menu.html       ← HTML del menú (include)
```

### Implementación del Menú (HTML)

Ver archivo: `frontend/includes/accessibility-menu.html`

### Estilos (CSS)

Ver archivo: `frontend/assets/css/accessibility.css`

### Lógica (JavaScript)

Ver archivo: `frontend/assets/js/accessibility-manager.js`

---

## ✨ Buenas Prácticas

### 1. Diseño Inclusivo desde el Inicio
- ❌ No: Añadir accesibilidad al final
- ✅ Sí: Diseñar con accesibilidad desde wireframes

### 2. Testing con Usuarios Reales
- Pruebas con usuarios de lectores de pantalla
- Validación con usuarios con discapacidades motrices
- Feedback de usuarios con baja visión

### 3. Herramientas de Testing
```bash
# Lighthouse (Chrome DevTools)
lighthouse https://localhost:5500 --view --preset=accessibility

# axe DevTools (Extensión de navegador)
# Pa11y (CLI)
pa11y http://localhost:5500

# WAVE (Extensión de navegador)
```

### 4. Checklist de Accesibilidad
- [ ] Todas las imágenes tienen alt text descriptivo
- [ ] Contraste de colores cumple WCAG AA (4.5:1)
- [ ] Navegación completa por teclado (Tab, Enter, Esc)
- [ ] Foco visible en todos los elementos interactivos
- [ ] HTML semántico (header, nav, main, article, aside, footer)
- [ ] Atributos ARIA correctos (role, aria-label, aria-describedby)
- [ ] Formularios con labels asociados
- [ ] Mensajes de error claros y programáticamente identificables
- [ ] Videos con subtítulos y transcripciones
- [ ] Texto redimensionable hasta 200% sin pérdida de funcionalidad

### 5. Documentación de Atajos
```html
<!-- Modal de ayuda de teclado -->
<div role="dialog" aria-labelledby="keyboard-help-title">
    <h2 id="keyboard-help-title">Atajos de Teclado</h2>
    <dl>
        <dt><kbd>Alt</kbd> + <kbd>M</kbd></dt>
        <dd>Abrir menú de accesibilidad</dd>
        
        <dt><kbd>Alt</kbd> + <kbd>1</kbd></dt>
        <dd>Ir a inicio</dd>
        
        <dt><kbd>Alt</kbd> + <kbd>D</kbd></dt>
        <dd>Alternar modo oscuro</dd>
        
        <dt><kbd>?</kbd></dt>
        <dd>Mostrar esta ayuda</dd>
    </dl>
</div>
```

### 6. Rendimiento
```javascript
// ✅ Usar CSS variables (rápido)
document.documentElement.style.setProperty('--font-size', '18px');

// ❌ Evitar cambiar estilos individuales (lento)
document.querySelectorAll('p').forEach(p => p.style.fontSize = '18px');

// ✅ Usar clases (muy rápido)
document.body.classList.toggle('dark-mode');

// ✅ Lazy load componentes pesados
const loadA11yPanel = async () => {
    const { AccessibilityPanel } = await import('./accessibility-panel.js');
    return new AccessibilityPanel();
};
```

### 7. Cumplimiento Legal
Muchas jurisdicciones requieren accesibilidad por ley:
- **EE.UU.**: ADA Title III, Section 508
- **UE**: European Accessibility Act (EAA)
- **UK**: Equality Act 2010
- **España**: RD 1112/2018 (accesibilidad de sitios web públicos)

---

## 📊 Métricas de Éxito

### Métricas Técnicas
- **Lighthouse Accessibility Score**: > 95
- **axe Issues**: 0 errores críticos
- **Keyboard Navigation**: 100% de funcionalidad accesible
- **Color Contrast**: 100% WCAG AA compliant

### Métricas de Usuario
- **Tasa de Adopción**: % usuarios que activan opciones de accesibilidad
- **Preferencias Populares**: Qué opciones se usan más
- **Tiempo de Tarea**: Comparar con/sin accesibilidad activada
- **Satisfacción**: Encuestas NPS de usuarios con discapacidades

---

## 🔗 Referencias

### Estándares
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Herramientas
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Guías
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
