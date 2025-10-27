# 🔒 SEGURIDAD Y ARQUITECTURA - Sistema de Trueques

## 📋 Tabla de Contenidos
1. [Seguridad OWASP Top 10](#seguridad-owasp-top-10)
2. [Modelo C4 del Sistema](#modelo-c4-del-sistema)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Cómo Probar el Sistema](#cómo-probar-el-sistema)

---

## 🛡️ SEGURIDAD OWASP TOP 10

El proyecto implementa protecciones contra varias vulnerabilidades del OWASP Top 10 (2021):

### ✅ A01:2021 – Broken Access Control (Control de Acceso Roto)

**Qué es:**
Cuando los usuarios pueden acceder a recursos que no deberían (ej: ver datos de otros usuarios, modificar cosas sin permiso).

**Cómo lo prevenimos:**
- ✓ Verificación de tokens JWT en rutas protegidas
- ✓ No exponemos contraseñas en las respuestas de la API
- ✓ Validación de que el usuario sea dueño del recurso antes de permitir modificaciones
- ✓ Campo `estado` para activar/desactivar usuarios

**Implementación:**
```python
# En router_auth.py
@auth_router.get("/me")
def obtener_usuario_actual(usuario_actual: dict = Depends(get_current_user)):
    # Solo retorna datos del usuario autenticado, no de otros
    return usuario_info
```

---

### ✅ A02:2021 – Cryptographic Failures (Fallas Criptográficas)

**Qué es:**
Guardar información sensible sin encriptar (como contraseñas en texto plano).

**Cómo lo prevenimos:**
- ✓ Contraseñas hasheadas con **bcrypt** (algoritmo muy seguro)
- ✓ NUNCA guardamos contraseñas en texto plano
- ✓ Tokens JWT firmados con clave secreta (SECRET_KEY)
- ✓ La clave secreta se guarda en variables de entorno (.env)

**Implementación:**
```python
# En auth_utils.py
def hash_password(password: str) -> str:
    return pwd_context.hash(password)  # bcrypt con salt automático

# Ejemplo de hash:
# Contraseña: "MiPassword123"
# Hash guardado: "$2b$12$LQ8Vz3..." (imposible de revertir)
```

---

### ✅ A03:2021 – Injection (Inyección)

**Qué es:**
Cuando un atacante puede insertar código malicioso en tu aplicación (ej: SQL Injection).

**Cómo lo prevenimos:**
- ✓ Uso de **SQLAlchemy** (ORM que previene SQL Injection automáticamente)
- ✓ Validación de datos con **Pydantic** (rechaza datos inválidos antes de procesarlos)
- ✓ Validación de tipos de datos (int, str, email, etc.)
- ✓ Validación de longitud mínima/máxima de campos

**Implementación:**
```python
# En auth_schema.py
class UsuarioRegistro(BaseModel):
    email: EmailStr  # Valida que sea un email real
    username: str = Field(min_length=3, max_length=50)  # Límites claros
    contrasena: str = Field(min_length=8)  # Contraseña mínima segura
    
# Pydantic automáticamente rechaza:
# - Emails inválidos
# - Usernames demasiado cortos/largos
# - Contraseñas débiles
# - Tipos de datos incorrectos
```

---

### ✅ A04:2021 – Insecure Design (Diseño Inseguro)

**Qué es:**
Falta de controles de seguridad en el diseño del sistema.

**Cómo lo prevenimos:**
- ✓ Separación de responsabilidades (routers, models, schemas, auth)
- ✓ Variables de entorno para configuración sensible
- ✓ Tokens con expiración (no duran para siempre)
- ✓ Documentación clara del flujo de autenticación

---

### ✅ A05:2021 – Security Misconfiguration (Configuración Insegura)

**Qué es:**
Configuraciones por defecto inseguras o información expuesta.

**Cómo lo prevenimos:**
- ✓ CORS configurado con orígenes específicos (no "*")
- ✓ Variables de entorno para credenciales (no hardcodeadas)
- ✓ Archivo .gitignore para no subir .env a GitHub
- ✓ Mensajes de error genéricos (no revelamos detalles internos)

**Implementación:**
```python
# En main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Solo orígenes específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### ✅ A07:2021 – Identification and Authentication Failures (Fallas de Autenticación)

**Qué es:**
Sistemas de login débiles que permiten accesos no autorizados.

**Cómo lo prevenimos:**
- ✓ Tokens JWT con expiración configurable
- ✓ Verificación de credenciales con bcrypt
- ✓ Mensajes genéricos de error (no revelamos si el username existe)
- ✓ Campo `estado` para desactivar cuentas comprometidas
- ✓ Verificación de estado activo en cada login

**Implementación:**
```python
# En router_auth.py - Login
if not usuario:
    # No decimos "username no existe" para no ayudar a atacantes
    raise HTTPException(detail="Credenciales incorrectas.")

if not verify_password(credenciales.contrasena, usuario.contrasena):
    # Mismo mensaje genérico
    raise HTTPException(detail="Credenciales incorrectas.")
```

---

## 🏗️ MODELO C4 DEL SISTEMA

### Nivel 1: Contexto del Sistema

```
┌─────────────────┐
│   Usuario Web   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────────────────┐
│   API Sistema de Trueques   │
│      (FastAPI + JWT)        │
└────────┬────────────────────┘
         │ SQL
         ↓
┌─────────────────┐
│    MariaDB      │
│  (Base de Datos)│
└─────────────────┘
```

**Descripción:**
- **Usuario Web**: Interactúa con el frontend (React, Vue, etc.)
- **API Sistema de Trueques**: Backend FastAPI que maneja lógica y autenticación
- **MariaDB**: Base de datos que almacena usuarios, artículos, trueques, etc.

---

### Nivel 2: Contenedores

```
┌──────────────────────────────────────────────────┐
│           API Sistema de Trueques                │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐             │
│  │   FastAPI   │  │  Auth Module │             │
│  │   Server    │◄─┤   (JWT)      │             │
│  └──────┬──────┘  └──────────────┘             │
│         │                                        │
│  ┌──────▼────────────────────┐                  │
│  │    SQLAlchemy ORM         │                  │
│  └──────┬────────────────────┘                  │
└─────────┼───────────────────────────────────────┘
          │
          ↓
  ┌───────────────┐
  │   MariaDB     │
  └───────────────┘
```

---

### Nivel 3: Componentes - Módulo de Autenticación

```
┌──────────────────────────────────────────────┐
│         Módulo de Autenticación              │
│                                              │
│  ┌────────────────┐                         │
│  │ router_auth.py │  (Endpoints)            │
│  │ - /registro    │                         │
│  │ - /login       │                         │
│  │ - /me          │                         │
│  └───────┬────────┘                         │
│          │                                   │
│          ↓                                   │
│  ┌────────────────┐   ┌──────────────┐     │
│  │ auth_schema.py │   │ auth_utils.py│     │
│  │ (Validación)   │   │ (JWT & Hash) │     │
│  └────────────────┘   └──────────────┘     │
│          │                     │            │
│          ↓                     ↓            │
│  ┌────────────────────────────────┐        │
│  │    dependencies.py             │        │
│  │    (Middleware protección)     │        │
│  └────────────────────────────────┘        │
└──────────────────────────────────────────────┘
```

**Flujo de componentes:**

1. **router_auth.py**: Define las rutas (endpoints)
   - `/registro`: Crear nuevo usuario
   - `/login`: Obtener token JWT
   - `/me`: Verificar usuario actual

2. **auth_schema.py**: Valida los datos de entrada
   - Verifica que el email sea válido
   - Verifica longitud de username y contraseña
   - Rechaza datos inválidos automáticamente

3. **auth_utils.py**: Funciones de seguridad
   - `hash_password()`: Hashea contraseñas con bcrypt
   - `verify_password()`: Verifica contraseñas
   - `create_access_token()`: Crea tokens JWT
   - `verify_token()`: Verifica tokens JWT

4. **dependencies.py**: Middleware de protección
   - `get_current_user()`: Protege rutas (requiere token válido)
   - `get_optional_user()`: Autenticación opcional

---

### Nivel 4: Ubicación de Archivos

```
SistemaTrueque/
├── config/
│   ├── db.py           → Conexión a BD (con variables de entorno)
│   └── security.py     → Configuración JWT y CORS
├── src/
│   ├── auth/           → 🔐 MÓDULO DE AUTENTICACIÓN
│   │   ├── auth_utils.py    → Hasheo y JWT
│   │   └── dependencies.py  → Middleware de protección
│   ├── model/
│   │   └── cliente.py       → Tabla de usuarios
│   ├── schema/
│   │   └── auth_schema.py   → Validación de datos
│   └── router/
│       └── router_auth.py   → Endpoints de auth
├── .env                → Variables de entorno (NO SUBIR A GITHUB)
├── .env.example        → Ejemplo de variables
└── main.py             → Aplicación principal + CORS
```

---

## 🔄 FLUJO DE AUTENTICACIÓN

### 1. Registro de Usuario

```
Frontend                    Backend                     Base de Datos
   │                           │                              │
   │  POST /api/auth/registro  │                              │
   ├──────────────────────────>│                              │
   │  {                         │                              │
   │    email: "...",           │  1. Validar datos (Pydantic)│
   │    username: "...",        │                              │
   │    contrasena: "..."       │  2. Verificar duplicados     │
   │  }                         ├─────────────────────────────>│
   │                            │  SELECT ... WHERE email=?    │
   │                            │<─────────────────────────────┤
   │                            │  (no existe)                 │
   │                            │                              │
   │                            │  3. Hashear contraseña       │
   │                            │     (bcrypt)                 │
   │                            │                              │
   │                            │  4. Guardar usuario          │
   │                            ├─────────────────────────────>│
   │                            │  INSERT INTO clientes...     │
   │                            │<─────────────────────────────┤
   │                            │  (usuario creado)            │
   │  {                         │                              │
   │    id: 1,                  │                              │
   │    email: "...",           │                              │
   │    username: "..."         │                              │
   │  }                         │                              │
   │<───────────────────────────┤                              │
```

### 2. Login (Obtener Token)

```
Frontend                    Backend                     Base de Datos
   │                           │                              │
   │  POST /api/auth/login     │                              │
   ├──────────────────────────>│                              │
   │  {                         │                              │
   │    username: "...",        │  1. Buscar usuario           │
   │    contrasena: "..."       ├─────────────────────────────>│
   │  }                         │  SELECT ... WHERE username=? │
   │                            │<─────────────────────────────┤
   │                            │  (usuario encontrado)        │
   │                            │                              │
   │                            │  2. Verificar contraseña     │
   │                            │     bcrypt.verify()          │
   │                            │                              │
   │                            │  3. Verificar estado activo  │
   │                            │                              │
   │                            │  4. Crear token JWT          │
   │                            │     {                        │
   │                            │       sub: "username",       │
   │                            │       email: "...",          │
   │                            │       user_id: 1,            │
   │                            │       exp: 1234567890        │
   │                            │     }                        │
   │  {                         │                              │
   │    access_token: "eyJ...", │                              │
   │    token_type: "bearer"    │                              │
   │  }                         │                              │
   │<───────────────────────────┤                              │
   │                            │                              │
   │  (Frontend guarda token)   │                              │
```

### 3. Acceder a Ruta Protegida

```
Frontend                    Backend                     
   │                           │                              
   │  GET /api/auth/me         │                              
   │  Header:                  │                              
   │  Authorization: Bearer    │                              
   │  eyJhbGc...               │                              
   ├──────────────────────────>│                              
   │                           │  1. Extraer token del header 
   │                           │                              
   │                           │  2. Verificar token JWT      
   │                           │     - Firma válida?          
   │                           │     - No expirado?           
   │                           │     - No modificado?         
   │                           │                              
   │                           │  3. Extraer info del token   
   │                           │     {                        
   │                           │       sub: "username",       
   │                           │       user_id: 1             
   │                           │     }                        
   │                           │                              
   │                           │  4. Buscar usuario en BD     
   │                           │     (opcional)               
   │                           │                              
   │  {                        │  5. Retornar datos           
   │    id: 1,                 │                              
   │    username: "...",       │                              
   │    email: "..."           │                              
   │  }                        │                              
   │<──────────────────────────┤                              
```

---

## 🧪 CÓMO PROBAR EL SISTEMA

Vamos a probar todo el flujo de autenticación paso a paso.

### Prerrequisitos

1. Tener MariaDB corriendo en `localhost:3307`
2. Base de datos `sistema_trueques` creada
3. Tabla `personas` con al menos 1 registro (para relacionar con cliente)

### Paso 1: Iniciar el servidor

```bash
# Desde la carpeta del proyecto
cd "d:\carpeta pasar\trabajos de la u\Quinto Ciclo\Github\DesarrolloSoftware\SistemaTrueque"

# Activar entorno virtual (si lo tienes)
.\virtual\Scripts\activate

# Iniciar servidor
uvicorn main:app --reload
```

El servidor iniciará en: `http://localhost:8000`

### Paso 2: Ver la documentación interactiva

Abre tu navegador en: `http://localhost:8000/docs`

Verás la documentación automática de FastAPI (Swagger UI) con todos los endpoints.

### Paso 3: Registrar un usuario

**Opción A: Desde Swagger UI (http://localhost:8000/docs)**

1. Busca `POST /api/auth/registro`
2. Click en "Try it out"
3. Ingresa los datos:
```json
{
  "email": "juan@example.com",
  "username": "juanperez",
  "contrasena": "Password123!",
  "persona_id": 1
}
```
4. Click en "Execute"
5. Deberías recibir respuesta 201 con los datos del usuario

**Opción B: Desde Python (requests)**

```python
import requests

url = "http://localhost:8000/api/auth/registro"
datos = {
    "email": "juan@example.com",
    "username": "juanperez",
    "contrasena": "Password123!",
    "persona_id": 1
}

response = requests.post(url, json=datos)
print(response.status_code)  # Debería ser 201
print(response.json())
```

**Opción C: Desde cURL**

```bash
curl -X POST "http://localhost:8000/api/auth/registro" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@example.com\",\"username\":\"juanperez\",\"contrasena\":\"Password123!\",\"persona_id\":1}"
```

### Paso 4: Hacer Login

**Opción A: Desde Swagger UI**

1. Busca `POST /api/auth/login`
2. Click en "Try it out"
3. Ingresa:
```json
{
  "username": "juanperez",
  "contrasena": "Password123!"
}
```
4. Click en "Execute"
5. **COPIA EL TOKEN** de la respuesta (algo como: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**Opción B: Desde Python**

```python
import requests

url = "http://localhost:8000/api/auth/login"
credenciales = {
    "username": "juanperez",
    "contrasena": "Password123!"
}

response = requests.post(url, json=credenciales)
token_data = response.json()
token = token_data["access_token"]
print(f"Token: {token}")
```

### Paso 5: Usar el token en una ruta protegida

**Opción A: Desde Swagger UI**

1. En la parte superior derecha, click en el botón "Authorize" 🔒
2. Ingresa: `Bearer <tu-token>` (reemplaza <tu-token> con el token real)
3. Click en "Authorize"
4. Ahora busca `GET /api/auth/me`
5. Click en "Try it out" → "Execute"
6. Deberías ver tu información de usuario

**Opción B: Desde Python**

```python
import requests

url = "http://localhost:8000/api/auth/me"
headers = {
    "Authorization": f"Bearer {token}"  # Token del paso anterior
}

response = requests.get(url, headers=headers)
print(response.json())  # Tus datos de usuario
```

**Opción C: Desde JavaScript (Frontend)**

```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Del login

fetch("http://localhost:8000/api/auth/me", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Paso 6: Probar casos de error

**Test 1: Login con contraseña incorrecta**
- Resultado esperado: Error 401 "Credenciales incorrectas"

**Test 2: Acceder a ruta protegida sin token**
- Resultado esperado: Error 401 "Not authenticated"

**Test 3: Acceder con token expirado**
- Espera 30 minutos (o cambia ACCESS_TOKEN_EXPIRE_MINUTES a 1)
- Resultado esperado: Error 401 "Token inválido o expirado"

**Test 4: Registrar email duplicado**
- Intenta registrar el mismo email dos veces
- Resultado esperado: Error 400 "El email ya está registrado"

---

## 📚 GLOSARIO DE TÉRMINOS

- **JWT (JSON Web Token)**: Token digital firmado que contiene información del usuario
- **Hashing**: Convertir una contraseña en código irreversible
- **bcrypt**: Algoritmo de hashing muy seguro para contraseñas
- **CORS**: Mecanismo que permite que el frontend (en otro puerto) acceda a la API
- **Bearer Token**: Tipo de token que se envía en el header "Authorization: Bearer <token>"
- **Middleware**: Función que se ejecuta antes de procesar una petición
- **ORM (SQLAlchemy)**: Librería que previene SQL Injection automáticamente
- **Pydantic**: Librería de validación de datos en Python

---

## 📖 PRÓXIMOS PASOS

1. **Proteger tus rutas existentes**
   - Aplica `Depends(get_current_user)` a las rutas que lo necesiten
   - Verifica permisos antes de modificar/eliminar recursos

2. **Agregar roles de usuario**
   - Crea una tabla de roles (admin, usuario, moderador)
   - Implementa verificación de roles en las rutas

3. **Mejorar la seguridad**
   - Agregar rate limiting (limitar intentos de login)
   - Implementar refresh tokens (tokens de larga duración)
   - Agregar verificación de email

4. **Testing**
   - Crear tests unitarios para las funciones de autenticación
   - Tests de integración para el flujo completo

5. **Monitoreo**
   - Agregar logs de intentos de login
   - Detectar patrones de ataque

---

## 🤝 COMPARTIR CON EL EQUIPO

Para que tu equipo use este código:

1. **Subir a GitHub** (sin .env)
   ```bash
   git add .
   git commit -m "Implementar autenticación JWT"
   git push
   ```

2. **Cada compañero debe:**
   - Clonar el repositorio
   - Copiar `.env.example` a `.env`
   - Modificar `.env` con sus credenciales locales
   - Instalar dependencias: `pip install -r requirements.txt`
   - Correr el servidor: `uvicorn main:app --reload`

3. **Documentar en el README**
   - Cómo configurar variables de entorno
   - Cómo generar una SECRET_KEY segura
   - Endpoints disponibles

---

## 📞 SOPORTE

Si tienes dudas sobre:
- **Seguridad**: Revisa la sección OWASP
- **Arquitectura**: Revisa el Modelo C4
- **Implementación**: Revisa los comentarios en el código
- **Testing**: Revisa la sección "Cómo Probar"
