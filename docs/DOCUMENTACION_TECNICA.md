#  Documentación Técnica - Sistema Truekealo

## Introducción

Truekealo es un sistema de intercambio de artículos entre usuarios, diseñado como proyecto integrador académico de segundo hito. Implementa una arquitectura moderna de frontend-backend integrado con autenticación JWT, base de datos relacional y API REST.

### Características Principales
- ✅ Autenticación y autorización con JWT
- ✅ Sistema CRUD completo para artículos
- ✅ Propuestas de intercambio entre usuarios
- ✅ Gestión de perfiles de usuario
- ✅ Búsqueda y filtrado avanzado
- ✅ Interfaz responsive con soporte dark mode
- ✅ API REST documentada con OpenAPI/Swagger
- ✅ Validación de datos con Pydantic

---

##  Arquitectura del Sistema

### Modelo C4 - Niveles de Abstracción

#### 1️⃣ **Nivel 1: Context Diagram**
Define el sistema como una caja negra y sus interacciones externas.

```
[Usuario] <--> [Sistema Truekealo] <--> [MariaDB]
                         |
                         └---> [Servicio Email]
```

#### 2️⃣ **Nivel 2: Container Diagram**
Desglosa el sistema en sus componentes principales.

```
┌─────────────────────────────────────────────┐
│          APLICACIÓN WEB (Frontend)          │
│  HTML5 + CSS3 (Tailwind) + JavaScript      │
└─────────────────────────────────────────────┘
                        ↕ (HTTP/HTTPS)
                   (JSON sobre REST)
┌─────────────────────────────────────────────┐
│         API BACKEND (FastAPI)               │
│  ┌─────────────────────────────────────┐   │
│  │ Routers (Endpoints REST)            │   │
│  │ - /auth        (Autenticación)      │   │
│  │ - /articulos   (CRUD Artículos)     │   │
│  │ - /propuestas  (Intercambios)       │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Core (Lógica Central)               │   │
│  │ - Security (JWT, bcrypt)            │   │
│  │ - Config (Variables de entorno)     │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Models (ORM SQLAlchemy)             │   │
│  │ - User, Articulo, Propuesta, etc.   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                        ↕ (SQL/PyMySQL)
┌─────────────────────────────────────────────┐
│         BASE DE DATOS (MariaDB)             │
│  ┌──────────────────────────────────────┐  │
│  │ Tablas:                              │  │
│  │ - users (Usuarios)                   │  │
│  │ - articulos (Items publicados)       │  │
│  │ - propuestas (Propuestas intercambio)│  │
│  │ - mensajes (Comunicación)            │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### 3️⃣ **Nivel 3: Component Diagram (Frontend)**
Estructura interna del frontend web.

```
Frontend Web
├── Módulos JavaScript Core
│   ├── api-client.js (Comunicación con API)
│   ├── app.js (Lógica general)
│   └── config.js (Configuración)
├── Templates HTML
│   ├── login.html
│   ├── dashboard.html
│   ├── explorar.html
│   ├── mis-articulos.html
│   ├── publicar.html
│   ├── propuesta-intercambio.html
│   ├── perfil.html
│   └── configuracion.html
├── Estilos CSS
│   ├── app.css (Base)
│   └── Tailwind CSS (Utilidades)
└── Componentes Compartidos
    ├── sidebar.html
    ├── head-meta.html
    └── footer-scripts.html
```

#### 4️⃣ **Nivel 4: Code Diagram (Backend)**
Diagrama de clases detallado del backend.

```
Backend FastAPI
├── Models (ORM SQLAlchemy)
│   ├── User
│   ├── Articulo
│   ├── Propuesta
│   └── Mensaje
├── Schemas (Pydantic)
│   ├── UserCreate, UserResponse, Token
│   ├── ArticuloCreate, ArticuloResponse
│   ├── PropuestaCreate, PropuestaResponse
│   └── MensajeCreate, MensajeResponse
├── Routers (API Endpoints)
│   ├── AuthRouter
│   ├── ArticulosRouter
│   └── PropuestasRouter
├── Core
│   ├── Security (JWT, hashing)
│   └── Config (Settings)
└── Database
    └── SessionLocal, engine, init_db()
```

---

##  Flujo de Datos

### 1. Autenticación (Login)

```
Cliente (Frontend)                Backend                   Base de Datos
    │                                │                           │
    ├─── POST /auth/login ────────────>                          │
    │     {email, password}           │                           │
    │                                 ├── Buscar usuario ─────────>
    │                                 │<── Usuario (hashed_pwd)───┤
    │                                 │                           │
    │                                 ├─ verify_password()        │
    │                                 │ (bcrypt)                  │
    │                                 │                           │
    │                                 ├─ create_access_token()    │
    │                                 │ (JWT)                     │
    │                                 │                           │
    │<─ 200 + Token + User Data ──────┤                          │
    │                                 │                           │
    └─ Guardar token en localStorage  │                           │
       Redirigir a dashboard          │                           │
```

### 2. Crear Artículo

```
Cliente (Frontend)                Backend                   Base de Datos
    │                                │                           │
    ├─ GET /auth/me ─────────────────>                          │
    │ (Validar token)                │ ├── Validar JWT           │
    │                                 │ └── Buscar usuario ───────>
    │<─ 200 OK + UserResponse ────────┤<────────────────────────┤
    │                                 │                           │
    ├─ POST /articulos/ ──────────────>                          │
    │ {titulo, desc, categoría...}    │                           │
    │ Header: Authorization: Bearer.. │                           │
    │                                 ├── Validar schema          │
    │                                 ├── Verificar usuario activo│
    │                                 ├── Crear artículo ─────────>
    │                                 │<─ Artículo creado ────────┤
    │                                 │                           │
    │<─ 201 + ArticuloResponse ───────┤                          │
    │                                 │                           │
    └─ Mostrar confirmación           │                           │
```

### 3. Enviar Propuesta de Intercambio

```
Cliente (Frontend)                Backend                   Base de Datos
    │                                │                           │
    ├─ POST /propuestas/ ────────────>                          │
    │ {articulo_ofrecido_id,          │                           │
    │  articulo_solicitado_id,        │ ├── Validar usuario       │
    │  mensaje}                       │ ├── Verificar artículos   ──>
    │                                 │ │   (existen y permisos)  <──
    │                                 │ │                          │
    │                                 │ ├── Crear propuesta ──────>
    │                                 │                           │
    │<─ 201 + PropuestaResponse ──────┤<─ Propuesta creada ───────┤
    │                                 │                           │
    └─ Mostrar confirmación           │                           │
      El receptor recibirá notificación
```

---

##  Modelo de Datos

### Tabla: Users
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    ubicacion VARCHAR(255),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (is_active)
);
```

### Tabla: Articulos
```sql
CREATE TABLE articulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria ENUM('electronica','ropa','libros','deportes','hogar','juguetes','otros'),
    estado_articulo ENUM('disponible','en_negociacion','intercambiado','no_disponible') DEFAULT 'disponible',
    valor_estimado FLOAT,
    imagen_url VARCHAR(500),
    condicion VARCHAR(50),
    propietario_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propietario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (propietario_id),
    INDEX (categoria),
    INDEX (estado_articulo),
    FULLTEXT INDEX (titulo, descripcion)
);
```

### Tabla: Propuestas
```sql
CREATE TABLE propuestas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_ofertante_id INT NOT NULL,
    usuario_receptor_id INT NOT NULL,
    articulo_ofrecido_id INT NOT NULL,
    articulo_solicitado_id INT NOT NULL,
    mensaje TEXT,
    estado ENUM('pendiente','aceptada','rechazada','cancelada','completada') DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_ofertante_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_receptor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (articulo_ofrecido_id) REFERENCES articulos(id) ON DELETE CASCADE,
    FOREIGN KEY (articulo_solicitado_id) REFERENCES articulos(id) ON DELETE CASCADE,
    INDEX (usuario_ofertante_id),
    INDEX (usuario_receptor_id),
    INDEX (estado)
);
```

### Tabla: Mensajes
```sql
CREATE TABLE mensajes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (remitente_id),
    INDEX (destinatario_id),
    INDEX (leido)
);
```

---

## 📡 Endpoints de la API REST

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registrar nuevo usuario |
| POST | `/api/v1/auth/login` | Iniciar sesión |
| GET | `/api/v1/auth/me` | Obtener usuario actual |

### Artículos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/articulos/` | Obtener todos los artículos |
| GET | `/api/v1/articulos/{id}` | Obtener un artículo específico |
| GET | `/api/v1/articulos/mis-articulos` | Obtener mis artículos |
| POST | `/api/v1/articulos/` | Crear nuevo artículo |
| PUT | `/api/v1/articulos/{id}` | Actualizar artículo |
| DELETE | `/api/v1/articulos/{id}` | Eliminar artículo |

### Propuestas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/propuestas/` | Crear propuesta |
| GET | `/api/v1/propuestas/recibidas` | Propuestas recibidas |
| GET | `/api/v1/propuestas/enviadas` | Propuestas enviadas |
| GET | `/api/v1/propuestas/{id}` | Obtener propuesta específica |
| PATCH | `/api/v1/propuestas/{id}` | Actualizar estado propuesta |

---

##  Seguridad

### Autenticación JWT

1. **Generación de Token:**
   ```python
   from datetime import timedelta
   from app.core.security import create_access_token
   
   # Al login exitoso
   access_token_expires = timedelta(minutes=30)
   access_token = create_access_token(
       data={"sub": str(user.id)},
       expires_delta=access_token_expires
   )
   ```

2. **Validación de Token:**
   ```python
   # En cada petición protegida
   async def get_current_user(
       token: str = Depends(oauth2_scheme),
       db: Session = Depends(get_db)
   ) -> User:
       # Decodifica y valida el JWT
       # Busca el usuario en BD
       # Verifica que esté activo
       return user
   ```

3. **Hashing de Contraseñas:**
   ```python
   from passlib.context import CryptContext
   
   pwd_context = CryptContext(schemes=["bcrypt"])
   
   # Al registrar
   hashed_password = pwd_context.hash(plain_password)
   
   # Al verificar
   is_correct = pwd_context.verify(plain_password, hashed_password)
   ```

### CORS (Cross-Origin Resource Sharing)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # [localhost:3000, localhost:8000, ...]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Headers de Seguridad

Cada petición del frontend debe incluir:
```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
}
```

---

##  Instrucciones de Instalación y Ejecución

### Requisitos Previos
- Python 3.9+
- MariaDB 10.x o superior
- Node.js (opcional, para desarrollo)
- Git

### 1. Setup de Base de Datos

```bash
# Conectarse a MariaDB
mysql -u root -p

# Crear base de datos
CREATE DATABASE truekealo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario
CREATE USER 'truekealo_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON truekealo_db.* TO 'truekealo_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Setup del Backend

```bash
# Navegar al directorio del backend
cd Truekealo/backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con los datos de tu BD
# DB_HOST=localhost
# DB_USER=truekealo_user
# DB_PASSWORD=tu_password_seguro
# etc.

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Setup del Frontend

```bash
# El frontend es estático, se sirve con cualquier servidor web
# Opción 1: Python
cd Truekealo/frontend
python -m http.server 5500

# Opción 2: Live Server (VS Code Extension)
# Click derecho > Open with Live Server

# Opción 3: Node.js
npx http-server
```

### 4. Verificación

- 🌐 Frontend: `http://localhost:5500` o `http://127.0.0.1:5500`
- 🔧 Backend: `http://localhost:8000`
- 📚 Documentación API: `http://localhost:8000/api/docs`

---

## 🔄 Flujo de Integración Frontend-Backend

### Paso 1: Usuario no autenticado
```
Browser → frontend/templates/login.html
```

### Paso 2: Submit del formulario de login
```javascript
// En login.html
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

await TruekealoAPI.Auth.login(email, password);
// Genera POST /api/v1/auth/login
```

### Paso 3: Respuesta del servidor
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nombre_completo": "Juan Pérez"
  }
}
```

### Paso 4: Almacenamiento de token
```javascript
// En api-client.js - TokenManager
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('user_data', JSON.stringify(response.user));
```

### Paso 5: Redirección a dashboard
```javascript
window.location.href = '/templates/dashboard.html';
```

### Paso 6: Peticiones autenticadas
```javascript
// Todas las peticiones posteriores incluyen el token
fetch('http://localhost:8000/api/v1/articulos/', {
    headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
})
```

---

##  Ejemplos de Uso

### Crear Artículo

```javascript
// En publicar.html
document.getElementById('publishForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const articuloData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        categoria: document.getElementById('categoria').value,
        valor_estimado: parseFloat(document.getElementById('valor').value),
        condicion: document.getElementById('condicion').value,
        imagen_url: document.getElementById('imagen').value
    };
    
    try {
        const articulo = await TruekealoAPI.Articulos.create(articuloData);
        Toast.success('Artículo publicado exitosamente');
        window.location.href = '/templates/mis-articulos.html';
    } catch (error) {
        Toast.error('Error al publicar artículo');
    }
});
```

### Cargar Artículos con Filtros

```javascript
// En explorar.html
async function cargarArticulos() {
    try {
        const params = {
            skip: 0,
            limit: 20,
            categoria: document.getElementById('filtroCategoria').value,
            estado: 'disponible'
        };
        
        const articulos = await TruekealoAPI.Articulos.getAll(params);
        
        // Renderizar artículos
        const container = document.getElementById('articulosContainer');
        container.innerHTML = articulos.map(art => `
            <div class="articulo-card">
                <img src="${art.imagen_url}" alt="${art.titulo}">
                <h3>${art.titulo}</h3>
                <p>${art.descripcion}</p>
                <button onclick="verDetalle(${art.id})">Ver Detalles</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarArticulos);
```

### Enviar Propuesta de Intercambio

```javascript
// En explorar.html - botón de hacer propuesta
async function enviarPropuesta(articuloSolicitadoId) {
    // Mostrar modal de selección de artículo a ofrecer
    const articuloOfrecidoId = prompt('ID del artículo que ofreces:');
    
    try {
        const propuesta = await TruekealoAPI.Propuestas.create({
            articulo_ofrecido_id: parseInt(articuloOfrecidoId),
            articulo_solicitado_id: articuloSolicitadoId,
            mensaje: document.getElementById('mensajePropuesta').value || null
        });
        
        Toast.success('Propuesta enviada correctamente');
    } catch (error) {
        Toast.error('Error al enviar propuesta');
    }
}
```

---

## 🧪 Testing

### Testing del Backend (Pytest)

```bash
# Instalar pytest
pip install pytest pytest-asyncio httpx

# Ejecutar tests
pytest

# Con coverage
pytest --cov=app
```

### Ejemplo de Test

```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "nombre_completo": "Test User",
            "password": "TestPass123"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"

def test_login_user():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

##  Estándares Aplicados

### Código
- ✅ PEP8 para Python
- ✅ ESLint para JavaScript
- ✅ Type hints en Python
- ✅ JSDoc en JavaScript

### Seguridad
- ✅ Contraseñas con bcrypt
- ✅ JWT para autenticación
- ✅ CORS habilitado
- ✅ Validación Pydantic
- ✅ SQL Injection prevention (ORM)

### Bases de Datos
- ✅ Normalización 3NF
- ✅ Índices en columnas de búsqueda
- ✅ Foreign Keys con ON DELETE CASCADE
- ✅ Timestamps audit (created_at, updated_at)

### Frontend
- ✅ Responsive Design (Mobile-first)
- ✅ Accesibilidad WCAG 2.1 (AA)
- ✅ Semantic HTML
- ✅ Performance (lazy loading, minification)

---

## 🐛 Resolución de Problemas

### Error: "No module named 'app'"
```bash
# Asegúrate de estar en el directorio correcto
cd Truekealo/backend

# Instala el paquete en modo desarrollo
pip install -e .
```

### Error: "Connection refused" al conectar BD
```bash
# Verifica que MariaDB esté corriendo
# Windows:
net start MariaDB

# Linux:
sudo systemctl start mariadb

# Verifica los datos en .env
# DB_HOST debe ser 'localhost' o '127.0.0.1'
# DB_PORT debe ser 3306
```

### Error: "CORS error" en Frontend
```javascript
// Verifica que la URL en api-client.js sea correcta
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api/v1', // ✓ Correcto
};

// Verifica que el backend tenga CORS habilitado
// En app/main.py está configurado por defecto
```

### Token JWT expirado
```javascript
// El token expira después de 30 minutos
// Usuario será redirigido al login automáticamente
// Para cambiar el tiempo:
// 1. Editar .env
// ACCESS_TOKEN_EXPIRE_MINUTES=60

// 2. Reiniciar el backend
```

---

## 📚 Referencias y Recursos

### Documentación Oficial
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Validation](https://docs.pydantic.dev/)
- [Python-Jose (JWT)](https://github.com/mpdavis/python-jose)

### Base de Datos
- [MariaDB Documentation](https://mariadb.com/docs/)
- [PyMySQL](https://pymysql.readthedocs.io/)

### Frontend
- [Tailwind CSS](https://tailwindcss.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript ES6+ Reference](https://javascript.info/)

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

## 📝 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-01-02 | Documentación inicial |
| 2.0.0 | Próxima | Mejoras en performance y seguridad |

---

**Documento elaborado para fines académicos - Proyecto Integrador Segundo Hito**

Última actualización: 2 de enero de 2025
