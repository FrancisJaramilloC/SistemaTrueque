# Nuevas Funciones de Autenticación y Seguridad

Este documento describe las nuevas características añadidas al sistema de autenticación (rama `Francisco`).

## Cambios Realizados

### 1. Roles y Permisos Básicos

**Modelo (`src/model/cliente.py`):**
- Columna `role` (String, default="user") — define el rol del cliente (user/admin).

**Schema (`src/schema/auth_schema.py`):**
- Campo `role` en `RegistroRespuesta` y `UsuarioRespuesta` — devuelve el rol del usuario.

**Lógica (`src/router/router_auth.py`):**
- Al registrarse, se asigna automáticamente rol `"user"`.
- Al hacer login, el rol se incluye en el JWT (en el payload).

**Uso en rutas protegidas:**
```python
from src.auth.dependencies import get_current_user
from fastapi import Depends, HTTPException, status

@app.get("/admin-only")
def admin_only(usuario_actual: dict = Depends(get_current_user)):
    # Acceder al rol desde el token (si se añade al JWT)
    if usuario_actual.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admin")
    return {"message": "Acceso concedido"}
```

---

### 2. Validación Fuerte de Contraseña

**Schema (`src/schema/auth_schema.py`):**
- Validador `validar_contrasena_fuerte` en `UsuarioRegistro` — valida:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula (A-Z)
  - Al menos 1 minúscula (a-z)
  - Al menos 1 número (0-9)
  - Al menos 1 carácter especial (!@#$%^&*)

**Ejemplo de contraseña válida:** `Password123!`

**Rechazo automático de contraseñas débiles:**
- El esquema Pydantic valida antes de llegar al router.
- Respuesta HTTP 422 (Validation Error) si la contraseña no es fuerte.

---

### 3. Bloqueo Temporal tras X Intentos Fallidos

**Modelo (`src/model/cliente.py`):**
- Columna `failed_login_attempts` (Integer, default=0) — contador de intentos fallidos.
- Columna `locked_until` (String, nullable) — fecha ISO8601 hasta la cual está bloqueada la cuenta.

**Configuración (`config/security.py`):**
```python
MAX_FAILED_LOGIN_ATTEMPTS = 5  # Bloquear tras 5 intentos fallidos
LOCK_MINUTES = 15  # Bloquear durante 15 minutos
```

**Lógica (`src/router/router_auth.py`):**
- Cada login fallido incrementa `failed_login_attempts`.
- Al alcanzar `MAX_FAILED_LOGIN_ATTEMPTS`, la cuenta se bloquea hasta `datetime.utcnow() + timedelta(minutes=LOCK_MINUTES)`.
- Si la cuenta está bloqueada, se rechaza el login con HTTP 403.
- Después del bloqueo, si la contraseña es correcta, se resetean los intentos.

---

### 4. Verificación por Email al Registro

**Modelo (`src/model/cliente.py`):**
- Columna `is_verified` (Boolean, default=False) — indica si el email fue verificado.
- Columna `verification_token` (String, nullable) — token único para verificar el email.

**Lógica de Registro (`src/router/router_auth.py`):**
- Al registrarse, se genera un UUID único como `verification_token`.
- El usuario recibe un email con un link que contiene el token (implementar email sender).
- **Nota:** Por ahora, el token se devuelve en la respuesta de registro para pruebas locales.

**Endpoint de Verificación:**
```
GET /api/auth/verify-email?token=<token_uuid>
```

**Lógica de Verificación:**
- Busca el usuario con ese token.
- Si existe y es válido, marca `is_verified = True` y limpia `verification_token`.
- Respuesta: `{"message": "Email verificado correctamente. Ya puedes iniciar sesión."}`

**Restricción en Login:**
- Si `is_verified = False`, se rechaza el login con HTTP 403.
- Mensaje: "Cuenta no verificada. Revisa tu email y confirma tu cuenta."

---

## Campos de Registro del Usuario

### Input (POST `/api/auth/registro`):
```json
{
  "email": "usuario@example.com",
  "username": "usuario",
  "contrasena": "Password123!",
  "persona_id": 1
}
```

### Output (Response 201):
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "username": "usuario",
  "estado": true,
  "persona_id": 1,
  "role": "user",
  "is_verified": false
}
```

**Nota:** El `verification_token` NO se devuelve en la respuesta (se oculta por seguridad).

---

## Campos Automáticos (NO ingresa usuario)

| Campo | Valor Inicial | Descripción |
|-------|---------------|-------------|
| `id` | Auto-increment | Identificador único |
| `role` | `"user"` | Rol del usuario (user/admin) |
| `is_verified` | `False` | Email sin verificar |
| `verification_token` | UUID | Token para verificar email |
| `failed_login_attempts` | `0` | Contador de intentos fallidos |
| `locked_until` | `NULL` | Fecha de desbloqueo (sin bloqueo inicial) |
| `estado` | `True` | Usuario activo por defecto |

---

## Flujos de Ejemplo

### Flujo 1: Registro → Verificación → Login

```bash
# 1. Registro
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "username": "juan",
    "contrasena": "MyPassword123!",
    "persona_id": 1
  }'

# Respuesta:
# {
#   "id": 1,
#   "email": "juan@example.com",
#   "username": "juan",
#   "estado": true,
#   "persona_id": 1,
#   "role": "user",
#   "is_verified": false
# }

# 2. Verificar email (token recibido por email o en respuesta para testing)
curl http://localhost:8000/api/auth/verify-email?token=<token_uuid>

# Respuesta: {"message": "Email verificado correctamente..."}

# 3. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "contrasena": "MyPassword123!"
  }'

# Respuesta:
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "token_type": "bearer"
# }
```

### Flujo 2: Bloqueo por Intentos Fallidos

```bash
# Intento 1-4: Contraseña incorrecta (sin bloqueo)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "contrasena": "WrongPassword1!"}'
# HTTP 401: Credenciales incorrectas

# Intento 5: Contraseña incorrecta (BLOQUEO ACTIVADO)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "contrasena": "WrongPassword1!"}'
# HTTP 403: Cuenta bloqueada hasta <fecha>

# Intento 6 (dentro del período de bloqueo): Incluso con contraseña correcta
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "contrasena": "MyPassword123!"}'
# HTTP 403: Cuenta bloqueada hasta <fecha>

# Después de 15 minutos: Login exitoso
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "contrasena": "MyPassword123!"}'
# HTTP 200: Token JWT
```

### Flujo 3: Validación de Contraseña Débil

```bash
# Contraseña sin mayúscula
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test",
    "contrasena": "password123!",
    "persona_id": 1
  }'
# HTTP 422: Contraseña debe contener al menos una mayúscula

# Contraseña sin número
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test",
    "contrasena": "Password!",
    "persona_id": 1
  }'
# HTTP 422: Contraseña debe contener al menos un número

# Contraseña sin carácter especial
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test",
    "contrasena": "Password123",
    "persona_id": 1
  }'
# HTTP 422: Contraseña debe contener al menos un carácter especial (!@#$%^&*)

# Contraseña válida
curl -X POST http://localhost:8000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test",
    "contrasena": "Password123!",
    "persona_id": 1
  }'
# HTTP 201: Usuario creado exitosamente
```

---

## Integración Futura

### 1. Email Sender
Implementar un servicio de email (SendGrid, Mailgun, etc.) para enviar automáticamente el link de verificación:
```python
# Ejemplo en router_auth.py
send_verification_email(usuario_creado.email, verification_token)
```

### 2. Roles en JWT
Actualmente, el `role` se almacena pero no se incluye en el payload del JWT. Para incluirlo:
```python
# En auth_utils.py - create_access_token
token_data = {
    "sub": username,
    "email": email,
    "user_id": user_id,
    "role": role  # Añadir rol
}
```

### 3. Middleware de Autorización
Crear un middleware para proteger rutas por rol:
```python
def require_admin(usuario_actual: dict = Depends(get_current_user)):
    if usuario_actual.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    return usuario_actual
```

---

## Archivos Modificados

- `src/model/cliente.py` — Añadidas columnas para rol, verificación y bloqueos
- `src/schema/auth_schema.py` — Validación de contraseña fuerte, nuevo schema `RegistroRespuesta`
- `src/router/router_auth.py` — Lógica de registro, bloqueos, verificación
- `config/security.py` — Constantes `MAX_FAILED_LOGIN_ATTEMPTS`, `LOCK_MINUTES`

---

## Notas de Seguridad

✅ **Implementado:**
- Hash de contraseña con argon2/bcrypt fallback
- Validación de contraseña fuerte
- Bloqueo temporal tras intentos fallidos
- Verificación de email antes del login
- Roles básicos (user/admin)

⚠️ **Recomendado:**
- Configurar email sender para enviar tokens automáticamente
- Añadir rate limiting en /login y /registro (por IP)
- Usar HTTPS en producción
- Rotar SECRET_KEY regularmente
- Añadir 2FA para usuarios con rol admin
- Implementar refresh tokens para sesiones largas

---

Última actualización: 5 de Noviembre de 2025
