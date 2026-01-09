# Menú de Accesibilidad - Truekealo

## Descripción General

El menú de accesibilidad de Truekealo es un conjunto integral de herramientas diseñadas para mejorar la experiencia de usuarios con diferentes necesidades de accesibilidad. El menú está disponible en todas las páginas del sistema y se puede acceder mediante un botón flotante en la esquina inferior derecha de la pantalla.

## Características Principales

### 1. **Tamaño de Texto**
- **Aumentar texto**: Incrementa el tamaño de la fuente en intervalos del 25% (hasta 200%)
- **Disminuir texto**: Reduce el tamaño de la fuente en intervalos del 25% (mínimo 75%)
- **Indicador de Tamaño**: Muestra el porcentaje actual del tamaño de texto
- **Persistencia**: Las preferencias se guardan automáticamente en localStorage

### 2. **Contraste y Colores**
- **Escala de Grises**: Desatura todos los colores de la página para usuarios con daltonismo o sensibilidad al color
- **Alto Contraste**: Aumenta el contraste visual entre elementos, especialmente útil para usuarios con baja visión
- **Contraste Negativo**: Invierte los colores (fondo oscuro, texto claro) para reducir fatiga ocular

### 3. **Fondo**
- **Fondo Claro**: Asegura un fondo blanco consistente en todas las páginas, mejorando la legibilidad

### 4. **Enlaces**
- **Enlaces Subrayados**: Subraya todos los enlaces del documento para mejorar su identificación y distinción del texto normal

### 5. **Fuente**
- **Fuente Legible**: Utiliza una fuente sans-serif (Arial/Helvetica) más legible con mayor espaciado entre letras y líneas

### 6. **Lectura en Voz Alta**
- **Leer Página**: Activa la síntesis de voz para leer el contenido de la página completa
- **Detener Lectura**: Pausa la lectura en voz alta en cualquier momento
- **Control de Velocidad**: Slider para ajustar la velocidad de lectura desde 0.5x a 2.0x
- **Soporte Multiidioma**: Detecta automáticamente el idioma de la página (español, inglés, etc.)

### 7. **Preferencias**
- **Restablecer Cambios**: Regresa todas las configuraciones de accesibilidad a sus valores predeterminados

## Ubicación y Acceso

El menú de accesibilidad se accede mediante:
- **Botón flotante**: Icono de silla de ruedas (♿) en la esquina inferior derecha de la pantalla
- **Atajo de teclado**: El botón es completamente accesible por teclado usando TAB y ENTER
- **Tecla ESC**: Cierra el menú de accesibilidad en cualquier momento

## Diseño Accesible

El menú de accesibilidad en sí mismo es completamente accesible:

### Accesibilidad WCAG 2.1 AA
- Contraste de colores suficiente (4.5:1 para texto normal, 3:1 para texto grande)
- Elementos focalizables con indicadores visuales claros
- Etiquetas ARIA apropiadas para lectores de pantalla
- Estructura semántica correcta

### Navegación por Teclado
- Todos los botones son accesibles mediante tabulación
- La navegación sigue un orden lógico
- Se puede cerrar con la tecla ESC
- Los controles deslizantes (sliders) funcionan con flechas de teclado

### Lectores de Pantalla
- Todos los elementos tienen etiquetas aria-label descriptivas
- Los botones indicadores de estado usan aria-pressed para estado
- Los grupos de controles están marcados apropiadamente con roles ARIA

## Persistencia de Configuración

Las preferencias del usuario se guardan automáticamente en `localStorage` bajo la clave `a11y-settings`. Esto significa:

- Las configuraciones se mantienen entre sesiones
- No requieren registro o cuenta
- Se pueden limpiar si el usuario borra el almacenamiento local del navegador
- Cada usuario obtiene su propia configuración independiente

### Estructura del almacenamiento:
```json
{
  "textSize": 100,
  "grayscale": false,
  "highContrast": false,
  "negativeContrast": false,
  "lightBackground": false,
  "underlineLinks": false,
  "readableFont": false,
  "speechRate": 1
}
```

## Compatibilidad de Navegadores

El menú de accesibilidad es compatible con:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Navegadores móviles modernos

### Características específicas por navegador:
- **Web Speech API**: Disponible en Chrome, Edge, Safari (síntesis de voz)
- **localStorage**: Todos los navegadores modernos
- **CSS Filter**: Todos los navegadores modernos

## Implementación Técnica

### Archivos del Sistema

1. **`frontend/includes/accessibility-menu.html`**
   - Estructura HTML del menú
   - Componente incluible mediante el sistema de includes

2. **`frontend/assets/css/accessibility-menu.css`**
   - Estilos del menú flotante
   - Clases de modificación para cada característica de accesibilidad
   - Soporte para modo oscuro del sistema

3. **`frontend/assets/js/accessibility.js`**
   - Lógica JavaScript principal
   - Clase `AccessibilityManager` que maneja todas las funcionalidades
   - Eventos y almacenamiento de preferencias

### Integración en Plantillas

El menú se integra en todas las plantillas con:

```html
<!-- En el <head> -->
<link href="/assets/css/accessibility-menu.css" rel="stylesheet">

<!-- En el <body> -->
<div data-include="accessibility-menu"></div>

<!-- Antes del cierre </body> -->
<script src="/assets/js/accessibility.js"></script>
```

## Variables CSS Personalizables

El menú utiliza variables CSS para permitir personalización:

```css
:root {
    --a11y-primary: #0066cc;           /* Color primario */
    --a11y-primary-hover: #0052a3;     /* Color al pasar el mouse */
    --a11y-bg: #ffffff;                /* Color de fondo */
    --a11y-border: #ddd;               /* Color de bordes */
    --a11y-text: #333333;              /* Color del texto */
    --a11y-secondary: #f5f5f5;         /* Color secundario */
    --a11y-danger: #d32f2f;            /* Color de peligro */
}
```

## Mejoras Futuras Sugeridas

1. **Más opciones de fuente**: Permitir elegir entre diferentes fuentes legibles
2. **Perfiles predefinidos**: Presets para diferentes tipos de discapacidades
3. **Idiomas adicionales**: Soporte para síntesis de voz en más idiomas
4. **Sincronización en la nube**: Guardar preferencias en el servidor si el usuario está autenticado
5. **Resaltado de enfoque**: Opción adicional para resaltar elementos con enfoque
6. **Animaciones reducidas**: Opción para reducir animaciones
7. **Control de saturación**: Control granular de saturación de color
8. **Dyslexia-friendly fonts**: Fuentes específicamente diseñadas para personas con dislexia

## Pruebas y Validación

### Herramientas de Prueba Recomendadas:
- **axe DevTools**: Para validar accesibilidad WCAG
- **NVDA Screen Reader**: Para pruebas con lector de pantalla en Windows
- **VoiceOver**: Para pruebas en macOS e iOS
- **Lighthouse**: Para auditoría de accesibilidad en Chrome

### Checklist de Validación:
- [ ] Todos los botones tienen etiquetas aria-label
- [ ] El teclado puede acceder a todos los controles
- [ ] El menú se cierra con ESC
- [ ] Las preferencias se guardan correctamente
- [ ] El menú es utilizable en modo oscuro
- [ ] La síntesis de voz funciona en al menos un navegador
- [ ] El zoom de texto funciona en todas las páginas
- [ ] Los filtros de color se aplican correctamente

## Soporte y Problemas Comunes

### El menú no aparece
1. Verificar que `accessibility.js` está cargado
2. Verificar que `accessibility-menu.css` está cargado
3. Verificar que `include-components.js` está cargado
4. Revisar la consola del navegador para errores

### La síntesis de voz no funciona
1. El navegador debe tener Web Speech API habilitada
2. Verificar que no hay otra síntesis de voz en marcha
3. Probar en Chrome/Edge (soporte más amplio)
4. Asegurarse de que el altavoz no está silenciado

### Las preferencias no se guardan
1. Verificar que localStorage está habilitado
2. Verificar que no hay restricción de cookies/almacenamiento
3. Limpiar la consola para errores de JavaScript

## Contacto y Reportes

Para reportar problemas o sugerir mejoras en el menú de accesibilidad, por favor:
1. Abrir un issue en el repositorio del proyecto
2. Incluir navegador, versión y pasos para reproducir
3. Indicar qué características funcionan y cuáles no

---

**Última actualización**: Enero 2026
**Versión**: 1.0
