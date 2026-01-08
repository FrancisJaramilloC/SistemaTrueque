# 🔄 Truekealo - Sistema de Intercambio de Artículos

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI 0.109.0](https://img.shields.io/badge/fastapi-0.109.0-green.svg)](https://fastapi.tiangolo.com/)
[![MariaDB 10.x](https://img.shields.io/badge/mariadb-10.x-orange.svg)](https://mariadb.org/)

##  Descripción

Truekealo es una plataforma web de **intercambio colaborativo de artículos** entre usuarios. Permite que personas publiquen artículos que no usan, busquen artículos de otros usuarios y realicen propuestas de intercambio sin intervención de dinero.

### Características Principales

-  **Autenticación Segura** con JWT y contraseñas hasheadas (bcrypt)
-  **Interfaz Responsive** con diseño mobile-first y soporte dark mode
-  **Sistema de Artículos** con CRUD completo, búsqueda y filtros
-  **Propuestas de Intercambio** entre usuarios
-  **Perfiles de Usuario** con información personal y historial
-  **API REST** documentada con Swagger/OpenAPI
-  **Menú de Accesibilidad Completo** con múltiples herramientas (WCAG 2.1 AA)
-  **Arquitectura Escalable** con separación de capas

### Frontend
- **HTML5** - Markup semántico
- **CSS3** - Tailwind CSS + CSS personalizado
- **JavaScript ES6+** - Vanilla JS sin dependencias externas

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para gestión de datos
- **Pydantic** - Validación de datos
- **Python-Jose** - JWT authentication
- **Passlib** - Password hashing

### Base de Datos
- **MariaDB ** - Base de datos relacional

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
- MariaDB 10.x
- Navegador moderno

### Instalación (Resumida)

```bash
# Backend
cd Truekealo/backend
python -m venv venv
source venv/bin/activate      # o: venv\Scripts\activate en Windows
cp .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend (otra terminal)
cd Truekealo/frontend
python -m http.server 5500
```

**Acceder en:** http://localhost:5500  
**Swagger API:** http://localhost:8000/api/docs

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

```
POST   /api/v1/auth/register        # Registro
POST   /api/v1/auth/login           # Login
GET    /api/v1/articulos/           # Listar artículos
POST   /api/v1/articulos/           # Crear artículo
GET    /api/v1/propuestas/recibidas # Propuestas recibidas
PATCH  /api/v1/propuestas/{id}      # Aceptar/rechazar
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
Frontend:        2500+ líneas HTML/CSS/JS
Documentación:   8700+ líneas (7 archivos)
Diagramas C4:    4 niveles (PlantUML)
Endpoints:       15+ documentados
Base de Datos:   4 tablas normalizadas
Dependencias:    27 paquetes Python
Total:           40+ archivos, 12,000+ líneas
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

# Terminal 2: Frontend  
cd Truekealo/frontend
python -m http.server 5500
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
-  [Arquitectura C4](docs/architecture/README.md) - Cómo ver diagramas

---

<div align="center">

[ Documentación Completa](docs/DOCUMENTACION_TECNICA.md) | [ Arquitectura](docs/architecture/)

Última actualización: 2 de enero de 2025

</div>