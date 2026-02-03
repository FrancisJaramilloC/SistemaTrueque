# 🔄 Truekealo - Sistema de Intercambio de Artículos

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI 0.109.0](https://img.shields.io/badge/fastapi-0.109.0-green.svg)](https://fastapi.tiangolo.com/)
[![MariaDB 10.x](https://img.shields.io/badge/mariadb-10.x-orange.svg)](https://mariadb.org/)

##  Descripción

Truekealo es una plataforma **multiplataforma** (web y móvil) de **intercambio colaborativo de artículos** entre usuarios. Permite que personas publiquen artículos que no usan, busquen artículos de otros usuarios y realicen propuestas de intercambio sin intervención de dinero.

### 📱 Disponible en:
- **Web** - Aplicación React moderna con accesibilidad completa
- **Móvil** - App nativa con React Native + Expo (Android/iOS)

### Características Principales

-  **Autenticación Segura** con JWT y contraseñas hasheadas (bcrypt)
-  **Interfaz React Moderna** con componentes reutilizables y hooks personalizados
-  **SPA (Single Page Application)** con navegación fluida sin recargas
-  **Sistema de Artículos** con CRUD completo, búsqueda en tiempo real y filtros
-  **Propuestas de Intercambio** entre usuarios con gestión de estados
-  **Sistema de Mensajería** integrado para comunicación entre usuarios
-  **Perfiles de Usuario** con información personal y historial de actividades
-  **Upload de Imágenes** con preview y validación de archivos
-  **API REST** documentada con Swagger/OpenAPI
-  **Menú de Accesibilidad Completo** con múltiples herramientas (WCAG 2.1 AA)
-  **Arquitectura Escalable** con separación de capas y Context API

### Frontend Web
- **React 19** - Biblioteca UI moderna con hooks
- **React Router v7** - Enrutamiento del lado del cliente
- **Vite 7** - Build tool ultrarrápido con HMR
- **Axios** - Cliente HTTP para comunicación con API
- **SweetAlert2** - Modales y notificaciones elegantes
- **CSS3** - CSS Modules + estilos personalizados
- **JavaScript ES6+** - JSX y componentes funcionales

### Frontend Móvil
- **React Native 0.76.5** - Framework móvil multiplataforma
- **Expo ~52.0.0** - Plataforma de desarrollo y herramientas
- **Expo Router ~4.0.0** - Navegación basada en archivos
- **Expo Image Picker** - Selección de imágenes desde galería
- **Expo Secure Store** - Almacenamiento seguro de tokens
- **Axios** - Cliente HTTP para API
- **@expo/vector-icons** - Biblioteca de iconos (Ionicons)

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para gestión de datos
- **Pydantic** - Validación de datos
- **Python-Jose** - JWT authentication
- **Passlib** - Password hashing

### Base de Datos
- **MariaDB** - Base de datos relacional

## 🏗️ Arquitectura del Frontend React

### Estructura de Componentes

```
frontend-react/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar.jsx       # Barra de navegación con menús
│   │   ├── Footer.jsx       # Pie de página
│   │   ├── AccessibilityPanel.jsx  # Panel de accesibilidad
│   │   ├── ProtectedRoute.jsx     # HOC para rutas protegidas
│   │   ├── FileUpload.jsx         # Componente de carga de archivos
│   │   ├── SearchBar.jsx          # Barra de búsqueda con debounce
│   │   ├── NotificationToast.jsx  # Sistema de notificaciones
│   │   └── UI/                    # Componentes UI base
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Home.jsx         # Página principal
│   │   ├── Login.jsx        # Autenticación
│   │   ├── Register.jsx     # Registro de usuarios
│   │   ├── Dashboard.jsx    # Panel de control
│   │   ├── Explorar.jsx     # Explorar artículos
│   │   ├── MisArticulos.jsx # Gestión de artículos propios
│   │   ├── PublicarArticulo.jsx   # Crear artículo
│   │   ├── EditArticulo.jsx       # Editar artículo
│   │   ├── ArticuloDetalle.jsx    # Detalle de artículo
│   │   ├── Mensajes.jsx           # Sistema de mensajería
│   │   ├── PropuestasRecibidas.jsx # Propuestas recibidas
│   │   ├── PropuestasEnviadas.jsx  # Propuestas enviadas
│   │   ├── Perfil.jsx             # Perfil de usuario
│   │   └── Configuracion.jsx      # Configuración de cuenta
│   ├── context/             # Context API
│   │   ├── AuthContext.jsx  # Estado de autenticación global
│   │   └── DialogContext.jsx # Gestión de diálogos
│   ├── services/            # Servicios API
│   │   ├── authService.js   # Autenticación
│   │   ├── articulosService.js    # Artículos
│   │   ├── propuestasService.js   # Propuestas
│   │   ├── mensajesService.js     # Mensajería
│   │   ├── actividadesService.js  # Actividades
│   │   └── axiosConfig.js         # Configuración Axios
│   ├── hooks/               # Custom hooks
│   │   ├── useAccessibility.js    # Hook de accesibilidad
│   │   └── useDebounce.js         # Hook de debounce
│   ├── utils/               # Utilidades
│   └── styles/              # Estilos globales
```

### Características Técnicas del Frontend Web

#### 🎯 Gestión de Estado
- **Context API**: Estado global de autenticación y diálogos
- **Local State**: useState y useEffect para estado de componentes
- **Custom Hooks**: Lógica reutilizable (useAccessibility, useDebounce)

#### 🔐 Autenticación y Seguridad
- **Token JWT**: Almacenamiento seguro en localStorage
- **Interceptores Axios**: Inyección automática de tokens
- **Rutas Protegidas**: HOC ProtectedRoute para control de acceso
- **Redirección Automática**: Logout y redirect en errores 401

#### 🎨 UI/UX
- **SPA con React Router**: Navegación sin recargas
- **Loading States**: Indicadores de carga en todas las operaciones
- **Error Handling**: Manejo elegante de errores con SweetAlert2
- **Responsive Design**: Funciona en todos los dispositivos
- **Accesibilidad**: Panel completo con herramientas WCAG 2.1 AA

#### ⚡ Optimizaciones
- **Vite HMR**: Hot Module Replacement para desarrollo rápido
- **Code Splitting**: Carga bajo demanda de componentes
- **Lazy Loading**: Optimización de imágenes y recursos
- **Debounce**: En búsquedas para reducir llamadas API
- **Axios Interceptors**: Manejo centralizado de requests/responses

---

## 📱 Arquitectura de la Aplicación Móvil

### Estructura de la App (Expo Router)

```
mobile/
├── app/                           # Pantallas (File-based routing)
│   ├── (auth)/                   # Grupo de autenticación
│   │   ├── login.jsx            # Inicio de sesión
│   │   └── register.jsx         # Registro de usuarios
│   ├── (tabs)/                  # Navegación por pestañas
│   │   ├── home.jsx            # Dashboard con estadísticas
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
│   │   ├── ArticuloCard.jsx   # Tarjeta de artículo
│   │   ├── EmptyState.jsx     # Estado vacío
│   │   ├── ErrorMessage.jsx   # Mensaje de error
│   │   ├── LoadingScreen.jsx  # Pantalla de carga
│   │   └── UI/                # Componentes UI básicos
│   ├── context/
│   │   └── AuthContext.jsx    # Contexto de autenticación
│   ├── services/              # Servicios API
│   │   ├── api.js            # Cliente HTTP base
│   │   ├── authService.js    # Autenticación
│   │   ├── articulosService.js # Artículos
│   │   ├── mensajesService.js  # Mensajes
│   │   └── propuestasService.js# Propuestas
│   └── constants/
│       └── config.js         # Configuración (API_URL, colores, etc.)
├── assets/                   # Recursos estáticos
├── app.json                 # Configuración de Expo
└── package.json             # Dependencias
```

### Características Técnicas del Móvil

#### 🎯 Funcionalidades Principales
- **Autenticación**: Login/registro con JWT y Secure Store
- **Dashboard**: Resumen de actividad con contadores en tiempo real
- **Artículos**: CRUD completo con carga de imágenes desde galería
- **Explorar**: Búsqueda en tiempo real y filtros por categoría
- **Propuestas**: Enviar, recibir, aceptar y rechazar intercambios
- **Mensajería**: Chat individual con actualización automática
- **Perfil**: Ver y editar información personal

#### 🔐 Seguridad Móvil
- **Expo Secure Store**: Almacenamiento encriptado de tokens
- **Token JWT**: Autenticación en todas las peticiones
- **Auto-logout**: Cierre de sesión automático en errores 401
- **Validación**: Verificación de permisos y propiedad

#### 🎨 UI/UX Móvil
- **Diseño Nativo**: Interfaz inspirada en iOS
- **Pull-to-refresh**: Actualización manual en todas las listas
- **Loading States**: Indicadores de carga en operaciones
- **Feedback Visual**: Alertas y confirmaciones nativas
- **Navegación Intuitiva**: Tab navigation + Stack navigation

#### ⚡ Optimizaciones Móviles
- **Expo Go**: Desarrollo rápido sin compilar
- **Hot Reload**: Cambios instantáneos en desarrollo
- **Image Optimization**: Compresión automática de imágenes (calidad 0.8)
- **Actualización Local**: Filtros locales para respuesta instantánea
- **Manejo de Errores**: Logs descriptivos para debugging

##  Documentación Completa

**[👉 ACCEDE AL ÍNDICE DE DOCUMENTACIÓN](docs/INDICE.md)** ← Punto de entrada principal

### Documentos Principales

| Documento | Descripción | Tiempo |
|-----------|-------------|--------|
| **[INDICE.md](docs/INDICE.md)** | Índice navegable de toda la documentación | 2 min |
| **[RESUMEN_VISUAL.md](docs/RESUMEN_VISUAL.md)** | Diagramas y visualizaciones del sistema | 5 min |
| **[DOCUMENTACION_TECNICA.md](docs/DOCUMENTACION_TECNICA.md)** | Arquitectura, API, seguridad, ejemplos | 30 min |
| **[INSTALACION.md](docs/INSTALACION.md)** | Guía paso a paso (BD, backend, frontend) | 20 min |
| **[GITFLOW_GUIDE.md](docs/GITFLOW_GUIDE.md)** | Control de versiones y convenciones | 15 min |
| **[RESUMEN_EJECUTIVO.md](docs/RESUMEN_EJECUTIVO.md)** | Resumen ejecutivo y checklist | 10 min |
| **[CHECKLIST_VERIFICACION.md](docs/CHECKLIST_VERIFICACION.md)** | Verificación de entregables | 5 min |
| **[architecture/](docs/architecture/)** | Diagramas C4 en PlantUML | 10 min |

---

##  Inicio Rápido

### Requisitos
- Python 3.9+
- Node.js 18+ y npm
- MariaDB 10.x
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalación (Resumida)

```bash
# 1. Backend
cd Truekealo/backend
python -m venv venv
source venv/bin/activate      # o: venv\Scripts\activate en Windows
cp .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# 2. Frontend Web (otra terminal)
cd Truekealo/frontend
npm install
npm run dev

# 3. App Móvil (otra terminal)
cd Truekealo/mobile
npm install
npm start
# Escanea el QR con Expo Go en tu dispositivo móvil
```

**Acceder en:**
- **Web**: http://localhost:5173 (Vite dev server)  
- **Móvil**: Escanea QR con Expo Go
- **Swagger API**: http://localhost:8001/api/docs

**Para instalación completa con BD:** Ver [docs/INSTALACION.md](docs/INSTALACION.md)

##  Rutas de Aprendizaje

###  Rápida (30 min)
1. [README.md](README.md) - Este archivo
2. [RESUMEN_VISUAL.md](docs/RESUMEN_VISUAL.md) - Visualizar arquitectura
3. [INSTALACION.md](docs/INSTALACION.md) - Setup rápido

###  Desarrollo
1. [INSTALACION.md](docs/INSTALACION.md) - Setup completo
2. [DOCUMENTACION_TECNICA.md](docs/DOCUMENTACION_TECNICA.md) - Entender API


##  Endpoints Principales

### API Backend
```
POST   /api/v1/auth/register        # Registro
POST   /api/v1/auth/login           # Login
GET    /api/v1/articulos/           # Listar artículos
POST   /api/v1/articulos/           # Crear artículo
GET    /api/v1/propuestas/recibidas # Propuestas recibidas
PATCH  /api/v1/propuestas/{id}      # Aceptar/rechazar
GET    /api/v1/mensajes/            # Mensajes del usuario
POST   /api/v1/mensajes/            # Enviar mensaje
```

### Rutas Frontend Web (React Router)
```
/                    # Home - Página principal
/login               # Iniciar sesión
/register            # Registrarse
/explorar            # Explorar artículos públicos
/articulo/:id        # Detalle de artículo
/dashboard           # Panel de control (protegido)
/mis-articulos       # Mis artículos (protegido)
/publicar            # Publicar artículo (protegido)
/editar/:id          # Editar artículo (protegido)
/mensajes            # Mensajería (protegido)
/propuestas-recibidas    # Propuestas recibidas (protegido)
/propuestas-enviadas     # Propuestas enviadas (protegido)
/perfil              # Perfil de usuario (protegido)
/configuracion       # Configuración (protegido)
```

### Rutas Móvil (Expo Router)
```
index                # Redirección según autenticación
(auth)/login         # Iniciar sesión
(auth)/register      # Registrarse
(tabs)/home          # Dashboard con estadísticas
(tabs)/explore       # Explorar artículos
(tabs)/add           # Publicar artículo
(tabs)/messages      # Lista de conversaciones
(tabs)/profile       # Perfil de usuario
articulo/[id]        # Detalle de artículo
conversacion/[id]    # Chat individual
mis-articulos        # Gestión de artículos
propuestas-enviadas  # Propuestas enviadas
propuestas-recibidas # Propuestas recibidas
mi-perfil            # Ver perfil
editar-perfil        # Editar perfil
configuracion        # Cambiar contraseña
```

**Documentación interactiva:** http://localhost:8000/api/docs  
**ReDoc alternativo:** http://localhost:8000/api/redoc

---

##  Seguridad

✅ JWT Authentication (30 min expiration)  
✅ Bcrypt password hashing (work factor 12)  
✅ CORS configuration (whitelist origins)  
✅ SQL Injection prevention (ORM)  
✅ Pydantic validation (input sanitization)  
✅ Environment variables (secrets management)  
✅ Ownership verification (authorization)  

---

## 📖 Información por Rol

### Para Estudiantes/Evaluadores
-  [RESUMEN_VISUAL.md](docs/RESUMEN_VISUAL.md) - Diagrama completo del sistema
-  [RESUMEN_EJECUTIVO.md](docs/RESUMEN_EJECUTIVO.md) - Resumen y checklist
-  [CHECKLIST_VERIFICACION.md](docs/CHECKLIST_VERIFICACION.md) - Qué fue completado

### Para Desarrolladores
-  [DOCUMENTACION_TECNICA.md](docs/DOCUMENTACION_TECNICA.md) - API y arquitectura
-  [Swagger UI](http://localhost:8000/api/docs) - API interactiva

### Para DevOps/Operadores
-  [INSTALACION.md](docs/INSTALACION.md) - Setup y deployment
-  [Backend README](Truekealo/backend/README.md) - Servidor
-  Instrucciones BD en INSTALACION.md (2500+ líneas)

---

##  Estadísticas del Proyecto

```
Backend:         1500+ líneas Python (15 archivos)
Frontend Web:    3500+ líneas JSX/CSS (40+ componentes)
Frontend Móvil:  2800+ líneas JSX (25+ pantallas)
Documentación:   10000+ líneas (9 archivos)
Diagramas C4:    4 niveles (PlantUML)
Endpoints:       15+ documentados
Base de Datos:   4 tablas normalizadas
Dependencias:    27 paquetes Python + 11 paquetes npm (web) + 9 paquetes (móvil)
Total:           80+ archivos, 17,800+ líneas
```

Ver [CHECKLIST_VERIFICACION.md](docs/CHECKLIST_VERIFICACION.md) para detalle completo.

---

## ♿ Funcionalidades de Accesibilidad

Truekealo incluye un **menú de accesibilidad completo** que cumple con los estándares WCAG 2.1 (AA) y proporciona múltiples herramientas para mejorar la experiencia de usuarios con diversas necesidades:

### 🔧 Herramientas Disponibles

#### 📝 Control de Texto
- **Aumentar/Disminuir Tamaño**: Ajusta el tamaño del texto de 75% a 200%
- **Fuente Legible**: Cambia a una fuente más fácil de leer (OpenDyslexic)
- **Indicador Visual**: Muestra el porcentaje actual del tamaño de texto

#### 🎨 Contraste y Colores
- **Escala de Grises**: Convierte todos los colores a escala de grises
- **Alto Contraste**: Mejora la diferenciación entre texto y fondo
- **Contraste Negativo**: Invierte los colores para lectura en modo oscuro
- **Fondo Claro**: Aplica un fondo blanco uniforme en todo el sitio

#### 🔗 Mejoras de Navegación
- **Enlaces Subrayados**: Subraya todos los enlaces para mejor identificación
- **Teclado Accesible**: Navegación completa con teclado (Tab, Enter, Escape)
- **ARIA Labels**: Etiquetas descriptivas para lectores de pantalla

#### 🔊 Lectura en Voz Alta
- **Leer Página**: Lectura automática del contenido de la página
- **Control de Velocidad**: Ajusta la velocidad de lectura (0.5x a 2.0x)
- **Stop/Pausa**: Control completo sobre la reproducción

#### 💾 Persistencia
- **Guardado Automático**: Todas las preferencias se guardan en localStorage
- **Restauración Automática**: Las configuraciones se aplican automáticamente en cada visita
- **Botón de Reset**: Restablece todas las configuraciones a valores predeterminados

### 🎯 Acceso al Menú

El menú de accesibilidad está disponible en todas las páginas del sitio:
- **Botón flotante** con icono ♿ en la esquina inferior derecha
- **Acceso por teclado**: Tab hasta el botón y presionar Enter
- **Cerrar con Escape**: Presiona Esc para cerrar el menú
- **Click fuera**: Cierra automáticamente al hacer click fuera del menú

### 📱 Responsive y Compatible

- Funciona en todos los dispositivos (desktop, tablet, móvil)
- Compatible con lectores de pantalla principales
- Sin dependencias externas (JavaScript vanilla)
- Ligero y optimizado (CSS modular)

### 📄 Archivos del Sistema

- **Frontend React**:
  - `frontend-react/src/components/AccessibilityPanel.jsx` - Componente React del panel
  - `frontend-react/src/hooks/useAccessibility.js` - Hook personalizado con toda la lógica
  - `frontend-react/src/hooks/useAccessibility.test.js` - Tests unitarios
  - Estilos integrados en el componente con CSS Modules
  
- **Frontend Legacy** (HTML/CSS/JS):
  - `frontend/assets/js/accessibility.js` - Lógica principal (561 líneas)
  - `frontend/assets/css/accessibility-menu.css` - Estilos del menú
  - `frontend/assets/css/accessibility.css` - Estilos de accesibilidad aplicados
  - `frontend/includes/accessibility-menu.html` - HTML del componente

---

##  Tips Útiles

**Primer inicio:**
```bash
# Terminal 1: Backend
cd Truekealo/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend Web
cd Truekealo/frontend
npm install
npm run dev

# Terminal 3: App Móvil
cd Truekealo/mobile
npm install
npm start
# Instala Expo Go en tu dispositivo y escanea el QR
```

**Configurar App Móvil:**
```javascript
// Edita mobile/src/constants/config.js
export const API_URL = 'http://TU_IP:8001/api/v1';
// Ejemplo: 'http://192.168.1.100:8001/api/v1'
// Tu dispositivo y PC deben estar en la misma red WiFi
```

**Ver API docs:**
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

**Resetear BD:**
Ver [DOCUMENTACION_TECNICA.md#troubleshooting](docs/DOCUMENTACION_TECNICA.md)

---

## Documentación de Referencia

-  [Backend README](Truekealo/backend/README.md) - Info del servidor
-  [Frontend Web README](Truekealo/frontend/README.md) - Aplicación web
-  [Mobile README](Truekealo/mobile/README.md) - Aplicación móvil completa
-  [Arquitectura C4](docs/architecture/README.md) - Cómo ver diagramas
-  [FIX Eliminar Artículos](docs/FIX_ELIMINAR_ARTICULOS.md) - Corrección móvil

---

<div align="center">

[ Documentación Completa](docs/DOCUMENTACION_TECNICA.md) | [ Arquitectura](docs/architecture/)

Última actualización: 2 de enero de 2025

</div>