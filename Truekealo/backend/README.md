# Backend - Truekealo

## 📖 Descripción

Backend de Truekealo desarrollado con **FastAPI**, una framework web moderna y rápida para construir APIs en Python. Este backend proporciona todos los endpoints necesarios para que el frontend pueda funcionar.

---

## 🏗️ Estructura de Carpetas

```
backend/
├── app/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Configuración centralizada
│   │   └── security.py            # JWT + Bcrypt
│   ├── database.py                # SQLAlchemy setup
│   ├── main.py                    # Aplicación FastAPI
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # Modelo Usuario
│   │   ├── articulo.py            # Modelo Artículo
│   │   ├── propuesta.py           # Modelo Propuesta
│   │   └── mensaje.py             # Modelo Mensaje
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                # /api/v1/auth endpoints
│   │   ├── articulos.py           # /api/v1/articulos endpoints
│   │   └── propuestas.py          # /api/v1/propuestas endpoints
│   └── schemas/
│       ├── __init__.py
│       ├── user.py                # User validation schemas
│       ├── articulo.py            # Articulo validation schemas
│       ├── propuesta.py           # Propuesta validation schemas
│       └── mensaje.py             # Mensaje validation schemas
├── .env.example                   # Template de variables de entorno
├── requirements.txt               # Dependencias Python
└── README.md                      # Este archivo

```

---

## 🚀 Inicio Rápido

### 1. Clonar o descargar el proyecto

```bash
cd SistemaTrueque-Personal--develop/Truekealo/backend
```

### 2. Crear entorno virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de BD
# DB_HOST=localhost
# DB_USER=truekealo_user
# DB_PASSWORD=tu_password
# etc...
```

### 5. Crear base de datos

```bash
# Ver docs/INSTALACION.md para instrucciones completas de BD
# O usar el script SQL incluido
mysql -u root -p < script_crear_bd.sql
```

### 6. Inicializar tablas (opcional, automático en primer inicio)

El backend crea automáticamente las tablas en el primer inicio gracias al lifespan context manager.

### 7. Ejecutar el servidor

```bash
# Desarrollo con auto-reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Producción (sin auto-reload)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: **http://localhost:8000**

---

## 📡 Documentación de API

### Swagger UI (OpenAPI Interactive)

Una vez que el servidor esté ejecutándose, puedes acceder a:

- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

### Documentación Completa

Para documentación completa de todos los endpoints, ver:
- 📖 [docs/DOCUMENTACION_TECNICA.md](../docs/DOCUMENTACION_TECNICA.md) - Endpoints detallados
- 📡 [Swagger UI](#swagger-ui-openapi-interactive) - Interactivo

---

## 🔌 Endpoints Principales

### Autenticación
```
POST   /api/v1/auth/register       - Registrar usuario
POST   /api/v1/auth/login          - Login y obtener token
GET    /api/v1/auth/me             - Info del usuario actual
```

### Artículos
```
GET    /api/v1/articulos/          - Listar artículos
GET    /api/v1/articulos/mis-articulos - Mis artículos
GET    /api/v1/articulos/{id}      - Detalle de artículo
POST   /api/v1/articulos/          - Crear artículo
PUT    /api/v1/articulos/{id}      - Actualizar artículo
DELETE /api/v1/articulos/{id}      - Eliminar artículo
```

### Propuestas
```
GET    /api/v1/propuestas/recibidas     - Propuestas recibidas
GET    /api/v1/propuestas/enviadas      - Propuestas enviadas
GET    /api/v1/propuestas/{id}          - Detalle de propuesta
POST   /api/v1/propuestas/              - Crear propuesta
PATCH  /api/v1/propuestas/{id}          - Actualizar estado
```

---

## 🔐 Autenticación

### JWT (JSON Web Tokens)

El backend usa JWT para autenticación stateless. Cada petición a un endpoint protegido debe incluir el token en el header:

```
Authorization: Bearer <token_aqui>
```

### Flujo de Autenticación

1. **Registro:**
   ```bash
   POST /api/v1/auth/register
   Body: {"email": "user@example.com", "password": "SecurePass123"}
   ```

2. **Login:**
   ```bash
   POST /api/v1/auth/login
   Body: {"username": "user@example.com", "password": "SecurePass123"}
   Response: {"access_token": "eyJ...", "token_type": "bearer"}
   ```

3. **Usar Token:**
   ```bash
   GET /api/v1/auth/me
   Header: Authorization: Bearer eyJ...
   ```

### Token Expiration

- **Tiempo de expiración:** 30 minutos (configurable en .env)
- **Al expirar:** Frontend redirige a login automáticamente
- **Renovación:** Se debe volver a hacer login

---

## 🗄️ Base de Datos

### Tablas

1. **users** - Usuarios registrados
2. **articulos** - Artículos publicados
3. **propuestas** - Propuestas de intercambio
4. **mensajes** - Mensajes entre usuarios

### Modelos ORM

Los modelos están en `app/models/`:

```python
# Ejemplo: Modelo Usuario
from app.models.user import User

# Crear usuario
user = User(email="user@example.com", full_name="John Doe")
db.add(user)
db.commit()

# Consultar usuarios
users = db.query(User).filter(User.email == "user@example.com").first()
```

### Consultas SQL

Para ver las sentencias SQL de creación de tablas, consultar:
- 📖 [docs/DOCUMENTACION_TECNICA.md#modelo-de-datos](../docs/DOCUMENTACION_TECNICA.md#-modelo-de-datos)

---

## 🛠️ Desarrollo

### Agregar un Nuevo Endpoint

1. **Crear el modelo** (si es necesario) en `app/models/`
2. **Crear los schemas** en `app/schemas/` para validación
3. **Crear el router** o agregar al router existente en `app/routers/`

Ejemplo:

```python
# app/routers/usuarios.py
from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/v1/usuarios", tags=["usuarios"])

@router.get("/", response_model=list[UserResponse])
async def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(User).all()
    return usuarios
```

### Estructura de Carpetas Recomendada

Al agregar nuevas features:

```
Cambios en este orden:
1. app/models/    - Agregar modelos ORM
2. app/schemas/   - Agregar schemas Pydantic
3. app/routers/   - Agregar endpoints
4. app/core/      - Si necesitas seguridad nueva
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
pytest

# Con cobertura
pytest --cov=app

# Test específico
pytest tests/test_auth.py -v
```

### Estructura de Tests

```
tests/
├── test_auth.py
├── test_articulos.py
├── test_propuestas.py
└── conftest.py  # Fixtures compartidas
```

### Ejemplo de Test

```python
def test_crear_usuario(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "SecurePass123"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

---

## 📊 Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=truekealo_user
DB_PASSWORD=tu_password_super_seguro
DB_NAME=truekealo_db

# Seguridad
SECRET_KEY=tu_clave_secreta_muy_larga_y_aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Aplicación
APP_NAME=Truekealo
APP_VERSION=1.0.0
DEBUG=False

# CORS
ALLOWED_ORIGINS=["http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:5500"]
```

---

## 🐛 Troubleshooting

### Error: "No module named 'app'"

**Solución:** Asegúrate de estar en la carpeta `backend/` y que el entorno virtual esté activado.

```bash
cd Truekealo/backend
# Verificar __init__.py existe
ls app/__init__.py
```

### Error: "Connection refused" en BD

**Solución:** Verificar que MariaDB está corriendo:

```bash
# Windows
mysql -u root -p

# Linux
sudo systemctl status mariadb
```

### Error: "CORS error" en Frontend

**Solución:** Verificar que `ALLOWED_ORIGINS` en `.env` incluye la URL del frontend:

```env
ALLOWED_ORIGINS=["http://localhost:5500", "http://127.0.0.1:5500"]
```

### Error: "ModuleNotFoundError"

**Solución:** Instalar dependencias:

```bash
pip install -r requirements.txt
```

---

## 📈 Performance

### Optimizaciones Incluidas

- ✅ Índices en columnas clave (email, titulo)
- ✅ Connection pooling en SQLAlchemy
- ✅ Lazy loading de relaciones
- ✅ Paginación en endpoints de lista

### Tips de Performance

```python
# ✅ Usar pagination
from fastapi import Query

@router.get("/articulos/")
async def listar_articulos(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return db.query(Articulo).offset(skip).limit(limit).all()

# ❌ Evitar: cargar todos los registros
return db.query(Articulo).all()  # Malo si hay muchos registros
```

---

## 🔄 Integración con Frontend

El frontend se conecta al backend a través de `api-client.js`:

```javascript
// Ejemplo en frontend
const api = window.TruekealoAPI;

// Login
const { token, user } = await api.Auth.login("user@example.com", "password");

// Crear artículo
const articulo = await api.Articulos.create({
    titulo: "Bicicleta",
    descripcion: "Bicicleta de montaña en buen estado",
    categoria: "deportes"
});

// Listar artículos
const articulos = await api.Articulos.getAll({ categoria: "libros" });
```

Para más info, ver: 📖 [docs/DOCUMENTACION_TECNICA.md#integración-frontend-backend](../docs/DOCUMENTACION_TECNICA.md#-integración-frontend-backend)

---

## 📚 Referencias

- 📖 [Documentación Técnica Completa](../docs/DOCUMENTACION_TECNICA.md)
- 🚀 [Guía de Instalación](../docs/INSTALACION.md)
- 🏗️ [Arquitectura C4](../docs/architecture/)
- 🔀 [GitFlow Guide](../docs/GITFLOW_GUIDE.md)
- 📑 [Índice de Documentación](../docs/INDICE.md)

---

## 🎯 Resumen

| Aspecto | Detalle |
|--------|---------|
| **Framework** | FastAPI 0.109.0 |
| **ORM** | SQLAlchemy 2.0.25 |
| **Validación** | Pydantic 2.5.3 |
| **Autenticación** | JWT + Bcrypt |
| **Base de Datos** | MariaDB 10.x |
| **Python** | 3.9+ |
| **Endpoints** | 15+ documentados |
| **Documentación** | Swagger + Markdown |

---

## 💡 Tips Útiles

### Ver logs del servidor
```bash
# Ya están habilitados en desarrollo con --reload
# Los logs mostrarán GET/POST/PUT/DELETE requests
```

### Resetear base de datos
```bash
# Eliminar todas las tablas
python -c "from app.database import Base, engine; Base.metadata.drop_all(engine)"

# Recrear tablas
python -m uvicorn app.main:app --reload
```

### Probar endpoint con curl
```bash
# Registrar usuario
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"SecurePass123"}'
```

---

## 📞 Soporte

- 💬 Revisar [DOCUMENTACION_TECNICA.md](../docs/DOCUMENTACION_TECNICA.md) para problemas comunes
- 🔧 Ejecutar en Swagger UI para pruebas interactivas: http://localhost:8000/api/docs
- 📖 Leer [INDICE.md](../docs/INDICE.md) para navegación de documentación

---

**Backend desarrollado:** 2 de enero de 2025  
**Versión:** 1.0.0  
**Licencia:** MIT
