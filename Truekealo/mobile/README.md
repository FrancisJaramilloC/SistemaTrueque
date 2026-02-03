# 📱 Truekealo Mobile App

Aplicación móvil del sistema de trueque Truekealo, desarrollada con React Native y Expo. Permite a los usuarios intercambiar artículos de manera fácil, segura y eficiente desde cualquier dispositivo móvil.

## 🚀 Instalación

### Requisitos Previos

- **Node.js** 18 o superior
- **npm** o **yarn**
- **Expo Go** instalado en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Para desarrollo iOS: macOS con Xcode
- Para desarrollo Android: Android Studio

### Pasos de Instalación

1. **Clonar el repositorio** (si aplica):
```bash
git clone [URL_DEL_REPOSITORIO]
cd truekeRe/Truekealo/mobile
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar la URL del backend**:
   
   Edita el archivo `src/constants/config.js`:
   ```javascript
   export const API_URL = 'http://TU_IP:8000'; // Ejemplo: http://192.168.1.100:8000
   ```

4. **Iniciar el servidor de desarrollo**:
```bash
npm start
```

5. **Escanear el código QR**:
   - Abre **Expo Go** en tu dispositivo
   - Escanea el código QR que aparece en la terminal o navegador

## 📱 Comandos Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Ejecutar en emulador/dispositivo Android
npm run ios        # Ejecutar en simulador/dispositivo iOS
npm run web        # Ejecutar en navegador web
npm run reset      # Limpiar caché y reiniciar
```

## ✨ Funcionalidades Principales

### ♿ Accesibilidad Completa
- **Sistema de accesibilidad WCAG 2.1 AA** idéntico a la versión web
- **Control de tamaño de texto** (75% - 150%)
- **Modos de contraste**: Escala de grises, alto contraste, invertir colores
- **Fondo claro** para mejor legibilidad
- **Fuente legible** con mejor espaciado
- **Lectura en voz alta** con control de velocidad (0.5x - 2.0x)
- **Persistencia de preferencias** con AsyncStorage
- **Panel flotante** siempre accesible
- **Compatible con lectores de pantalla** (TalkBack, VoiceOver)
- 📖 **[Ver documentación completa de accesibilidad](ACCESIBILIDAD.md)**

### 🔐 Autenticación y Seguridad
- **Registro de usuarios** con validación de datos
- **Login seguro** con tokens JWT
- **Cierre de sesión** automático y manual
- **Almacenamiento seguro** de credenciales usando Expo Secure Store
- **Validación de email** y contraseña

### 🏠 Dashboard/Inicio
- **Resumen visual** de actividad del usuario
- **Contador de propuestas recibidas** pendientes
- **Contador de propuestas enviadas** pendientes
- **Mensajes no leídos** en tiempo real
- **Total de artículos publicados**
- **Accesos rápidos** a secciones principales
- **Actualización pull-to-refresh**

### 📦 Gestión de Artículos

#### Publicar Artículos
- **Formulario completo** con:
  - Título del artículo
  - Descripción detallada
  - Categorías predefinidas (Electrónica, Ropa, Hogar, Deportes, Libros, Juguetes, Otros)
  - Estado del artículo (Disponible, Intercambiado, No disponible)
  - Condición (Nuevo, Usado - Como nuevo, Usado - Buen estado, Usado - Aceptable)
- **Carga de imágenes** desde galería
- **Previsualización** de imagen antes de publicar
- **Validación** de campos obligatorios

#### Mis Artículos
- **Listado completo** de artículos propios
- **Visualización de imágenes** en miniatura
- **Estados visuales** con colores distintivos
- **Opciones de gestión**:
  - Editar artículo
  - Eliminar artículo (con confirmación)
  - Cambiar estado (Disponible/No disponible)
- **Pull-to-refresh** para actualizar
- **Mensaje informativo** si no hay artículos

#### Explorar Artículos
- **Catálogo completo** de artículos disponibles
- **Búsqueda en tiempo real** por título
- **Filtros por categoría** con botones visuales
- **Vista detallada** al tocar un artículo
- **Indicadores visuales** de estado y condición
- **Imágenes de alta calidad**
- **Pull-to-refresh** para actualizar

#### Detalle de Artículo
- **Información completa** del artículo
- **Imagen en tamaño completo**
- **Datos del propietario**
- **Botón para enviar propuesta** de trueque
- **Botón para contactar** por mensaje directo
- **Modal de selección** de artículo propio para intercambio

### 🤝 Sistema de Propuestas de Trueque

#### Propuestas Enviadas
- **Listado de todas las propuestas** que has enviado
- **Filtros por estado**:
  - Todas
  - Pendientes
  - Aceptadas
  - Rechazadas
  - Canceladas
- **Información detallada**:
  - Artículo que ofreces
  - Artículo que solicitas
  - Fecha de envío
  - Estado actual
  - Datos del destinatario
- **Cancelar propuesta** (solo si está pendiente)
- **Indicadores visuales** de estado con colores

#### Propuestas Recibidas
- **Listado de propuestas** que otros te han enviado
- **Filtros por estado** (igual que enviadas)
- **Acciones disponibles**:
  - Aceptar propuesta
  - Rechazar propuesta
  - Ver detalles completos
- **Notificaciones visuales** para propuestas pendientes
- **Confirmaciones** antes de aceptar/rechazar
- **Actualización automática** de contadores

### 💬 Sistema de Mensajería

#### Lista de Conversaciones
- **Todas tus conversaciones** en un lugar
- **Vista previa** del último mensaje
- **Indicador de mensajes no leídos**
- **Información del otro usuario**
- **Fecha y hora** del último mensaje
- **Acceso directo** a cada conversación
- **Pull-to-refresh** para actualizar

#### Chat Individual
- **Conversaciones en tiempo real**
- **Historial completo** de mensajes
- **Interfaz tipo WhatsApp**:
  - Mensajes enviados a la derecha (azul)
  - Mensajes recibidos a la izquierda (gris)
- **Marcas de tiempo** en cada mensaje
- **Campo de texto** con botón de envío
- **Scroll automático** a mensajes nuevos
- **Actualización automática** cada 3 segundos

### 👤 Perfil de Usuario

#### Ver Perfil
- **Información personal**:
  - Avatar con inicial del nombre
  - Nombre completo
  - Email
  - Teléfono
  - Ubicación
- **Diseño limpio** y organizado
- **Secciones claramente diferenciadas**

#### Editar Perfil
- **Formulario de actualización** con:
  - Nombre completo
  - Email
  - Teléfono
  - Ubicación
- **Validaciones en tiempo real**:
  - Formato de email válido
  - Campos obligatorios
  - Longitud mínima/máxima
- **Guardado automático** de cambios
- **Feedback visual** de éxito/error

#### Configuración
- **Cambio de contraseña** seguro
- **Validaciones**:
  - Contraseña actual requerida
  - Nueva contraseña mínimo 8 caracteres
  - Confirmación de contraseña
- **Botón de cerrar sesión**
- **Confirmación** antes de cerrar sesión

## 🏗️ Arquitectura del Proyecto

```
mobile/
├── app/                           # Pantallas (Expo Router)
│   ├── (auth)/                   # Pantallas de autenticación
│   │   ├── login.jsx            # Inicio de sesión
│   │   └── register.jsx         # Registro
│   ├── (tabs)/                  # Navegación principal (tabs)
│   │   ├── home.jsx            # Dashboard/Inicio
│   │   ├── explore.jsx         # Explorar artículos
│   │   ├── add.jsx             # Publicar artículo
│   │   ├── messages.jsx        # Lista de conversaciones
│   │   ├── profile.jsx         # Perfil de usuario
│   │   └── _layout.jsx         # Layout de tabs
│   ├── articulo/
│   │   └── [id].jsx            # Detalle de artículo
│   ├── conversacion/
│   │   └── [id].jsx            # Chat individual
│   ├── configuracion.jsx        # Cambiar contraseña
│   ├── editar-perfil.jsx       # Editar perfil
│   ├── mi-perfil.jsx           # Ver perfil completo
│   ├── mis-articulos.jsx       # Gestión de artículos
│   ├── propuestas-enviadas.jsx # Propuestas enviadas
│   ├── propuestas-recibidas.jsx# Propuestas recibidas
│   ├── index.jsx               # Redirección inicial
│   └── _layout.jsx             # Layout principal
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── AccessibilityPanel.jsx  # Panel de accesibilidad
│   │   ├── AccessibleText.jsx      # Text con escalado automático
│   │   ├── AccessibleView.jsx      # View con filtros
│   │   ├── ReadAloudButton.jsx     # Botón de lectura en voz alta
│   │   ├── ArticuloCard.jsx   # Tarjeta de artículo
│   │   ├── EmptyState.jsx     # Estado vacío
│   │   ├── ErrorMessage.jsx   # Mensaje de error
│   │   ├── LoadingScreen.jsx  # Pantalla de carga
│   │   └── UI/                # Componentes UI básicos
│   ├── context/
│   │   ├── AccessibilityContext.jsx # Contexto de accesibilidad
│   │   └── AuthContext.jsx    # Contexto de autenticación
│   ├── services/              # Servicios API
│   │   ├── api.js            # Cliente Axios base
│   │   ├── authService.js    # Autenticación
│   │   ├── articulosService.js # Artículos
│   │   ├── mensajesService.js  # Mensajes
│   │   ├── propuestasService.js# Propuestas
│   │   └── actividadesService.js# Actividades
│   └── constants/
│       └── config.js         # Configuración (API_URL, colores, etc.)
├── assets/                   # Recursos estáticos
├── app.json                 # Configuración de Expo
├── package.json             # Dependencias
├── ACCESIBILIDAD.md         # 📖 Documentación de accesibilidad
└── README.md               # Este archivo
```

## 🛠️ Tecnologías y Librerías

### Core
- **React Native** 0.76.5 - Framework móvil multiplataforma
- **Expo** ~52.0.0 - Plataforma de desarrollo
- **React** 18.3.1 - Librería base

### Navegación
- **Expo Router** ~4.0.0 - Navegación basada en archivos
- **React Navigation** 6.x - Stack y Tab navigation
- **React Native Screens** - Optimización de pantallas

### Comunicación con API
- **Axios** ^1.13.4 - Cliente HTTP
- **JWT** - Tokens de autenticación

### Funcionalidades
- **Expo Image Picker** ~16.0.0 - Selección de imágenes
- **Expo Secure Store** ~14.0.0 - Almacenamiento seguro
- **Expo Speech** ~12.1.0 - Texto a voz (accesibilidad)
- **AsyncStorage** ^2.1.0 - Persistencia local
- **Expo Linking** ^7.0.5 - Deep linking
- **@expo/vector-icons** ^14.0.2 - Iconos (Ionicons)

### UI/UX
- **React Native Safe Area Context** - Áreas seguras
- **Expo Status Bar** - Barra de estado

## 🎨 Características de Diseño

### Paleta de Colores
- **Primary**: `#007AFF` - Azul principal
- **Success**: `#34C759` - Verde éxito
- **Warning**: `#FF9500` - Naranja advertencia
- **Danger**: `#FF3B30` - Rojo peligro
- **Background**: `#F2F2F7` - Fondo gris claro
- **Surface**: `#FFFFFF` - Blanco
- **Text**: `#000000` - Negro texto principal
- **TextSecondary**: `#8E8E93` - Gris texto secundario

### Experiencia de Usuario
- **Diseño intuitivo** inspirado en iOS
- **Animaciones suaves** en transiciones
- **Feedback visual** inmediato
- **Indicadores de carga** en operaciones
- **Pull-to-refresh** en todas las listas
- **Mensajes de confirmación** en acciones críticas
- **Estados vacíos** informativos
- **Gestión de errores** con mensajes claros

## 🔧 Configuración Avanzada

### Variables de Entorno
Edita `src/constants/config.js`:

```javascript
// URL del backend (cambia según tu red)
export const API_URL = 'http://192.168.1.100:8000';

// Colores del tema
export const COLORS = {
  primary: '#007AFF',
  // ... más colores
};

// Espaciado
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Tipografía
export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  // ... más estilos
};
```

### Conectar con Backend Local
1. Asegúrate de que el backend esté corriendo en `http://localhost:8000`
2. Obtén tu IP local:
   - Windows: `ipconfig` → busca "IPv4"
   - Mac/Linux: `ifconfig` → busca "inet"
3. Actualiza `API_URL` con tu IP: `http://TU_IP:8000`
4. Tu dispositivo y computadora deben estar en la misma red WiFi

## 🐛 Solución de Problemas

### Error de conexión al backend
```
Network Error o Error al cargar datos
```
**Solución**:
- Verifica que el backend esté corriendo
- Confirma que `API_URL` tenga tu IP correcta
- Asegúrate de estar en la misma red WiFi
- Prueba hacer ping a la IP desde tu dispositivo

### Error al cargar imágenes
```
Cannot load image
```
**Solución**:
- Verifica permisos de galería en tu dispositivo
- Reinicia Expo Go
- Limpia caché: `npm run reset`

### Expo Go no conecta
```
Unable to connect to Expo
```
**Solución**:
- Verifica que tu dispositivo y PC estén en la misma red
- Desactiva VPNs o firewalls
- Intenta conectar por túnel: `expo start --tunnel`

### Token expirado
```
401 Unauthorized
```
**Solución**:
- Cierra sesión y vuelve a iniciar
- El token JWT expira después de cierto tiempo

## 📝 Notas Importantes

- **Imágenes**: Se suben en formato base64, limitadas a calidad 0.8
- **Actualización automática**: Los mensajes se actualizan cada 3 segundos
- **Estados de artículos**: Solo artículos "disponibles" se pueden intercambiar
- **Propuestas**: Una vez aceptada/rechazada, no se puede cambiar
- **Seguridad**: Las contraseñas se almacenan hasheadas en el backend

## 🚀 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Chat en tiempo real con WebSockets
- [ ] Modo oscuro
- [ ] Múltiples imágenes por artículo
- [ ] Sistema de calificaciones
- [ ] Historial de intercambios
- [ ] Búsqueda avanzada con filtros
- [ ] Compartir artículos
- [ ] Favoritos

## 👥 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Desarrollado con** ❤️ **usando React Native + Expo**
