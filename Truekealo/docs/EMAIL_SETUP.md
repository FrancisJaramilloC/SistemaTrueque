# 📧 Configuración de Email - Recuperación de Contraseña

## Descripción General

El sistema de recuperación de contraseña ahora envía un **código seguro por email** al usuario. Este código expira en **1 hora** por razones de seguridad.

## ¿Cómo funciona?

1. **Usuario solicita recuperación** → Ingresa su email
2. **Sistema genera token** → Lo guarda en la base de datos con expiración de 1 hora
3. **Email se envía** → Usuario recibe el código en su correo
4. **Usuario verifica token** → Ingresa el código recibido
5. **Usuario cambia contraseña** → Establece nueva contraseña
6. **Token se elimina** → No puede reutilizarse

## Configuración de Email

### Opción 1: Gmail (Recomendado para desarrollo)

#### Paso 1: Habilitar contraseñas de aplicación

1. Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
2. En la sección **"Your Google Account"**, haz clic en **"Security"** (lado izquierdo)
3. Habilita **"2-Step Verification"** si aún no está activo
4. Vuelve a **Security** y busca **"App passwords"**
5. Selecciona:
   - **App**: Mail
   - **Device**: Windows Computer (o tu dispositivo)
6. Se te generará una contraseña de 16 caracteres
7. Copia esa contraseña

#### Paso 2: Configurar variables de entorno

En el archivo `.env` del backend, añade:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=tu-email@gmail.com
SENDER_PASSWORD=abcd efgh ijkl mnop
```

**Nota:** La contraseña de aplicación no tiene espacios en `.env`, pero Gmail la genera con espacios. Cópiala tal como aparece.

### Opción 2: SendGrid (Recomendado para producción)

#### Paso 1: Crear cuenta SendGrid

1. Ve a [sendgrid.com](https://sendgrid.com)
2. Crea una cuenta gratuita
3. En **Settings → API Keys**, crea una nueva API key
4. Copia la API key completa (algo como `SG.xxx...`)

#### Paso 2: Configurar variables de entorno

En el archivo `.env`:

```env
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SENDER_EMAIL=apikey
SENDER_PASSWORD=SG.tu-api-key-completa
```

**Nota:** Para SendGrid, `SENDER_EMAIL` es literalmente `apikey`, no tu email.

### Opción 3: Otro proveedor SMTP

Si usas otro proveedor (Mailgun, AWS SES, etc.):

```env
SMTP_SERVER=smtp.tu-proveedor.com
SMTP_PORT=587
SENDER_EMAIL=tu-email@tudominio.com
SENDER_PASSWORD=tu-contraseña-smtp
```

## Desarrollo sin Email (Modo Debug)

Si no quieres configurar email aún, el sistema muestra el token en la **consola del backend**:

```
============================================================
[DESARROLLO - EMAIL NO CONFIGURADO]
============================================================
Email destinatario: usuario@example.com
Nombre usuario: Juan Pérez
Token de recuperación: AbCdEfGhIjKlMnOpQrStUvWxYz...
============================================================
```

Luego puedes copiar ese token en la interfaz de "Recuperar Contraseña".

## Estructura del Email Enviado

El usuario recibe un email con:

- **Logo y branding** de Truekealo
- **Código de recuperación** destacado (fácil de copiar)
- **Instrucciones paso a paso**
- **Aviso de expiración** (1 hora)
- **Enlace para contactar** si no solicitó el cambio

## Validación de Seguridad

```python
# El token es verificado en tres puntos:

1. Endpoint: GET /api/v1/auth/verify-token/{token}
   - Valida que el token existe
   - Valida que no ha expirado
   
2. Endpoint: POST /api/v1/auth/reset-password
   - Re-valida el token
   - Re-valida la expiración
   - Cambiar la contraseña
   - Elimina el token para que no pueda reutilizarse
```

## Instalación de Dependencias

El paquete `python-email` ya está incluido en `requirements.txt`.

Para instalar/actualizar:

```bash
cd backend
pip install -r requirements.txt
```

O instalar directamente:

```bash
pip install python-email python-dotenv
```

## Testing Manual

### Flujo completo:

1. **Inicia el backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Abre el frontend:** `http://127.0.0.1:5500`

3. **Ve a "Recuperar Contraseña"**

4. **Ingresa un email registrado**

5. **Si email está configurado:**
   - El usuario recibe el email
   - Copia el código del email
   - Lo ingresa en el formulario

6. **Si email NO está configurado:**
   - Revisa la consola del backend
   - Copia el token mostrado
   - Lo ingresa en el formulario

7. **Verifica el token** (se valida automáticamente)

8. **Cambia tu contraseña**

9. **Intenta login con la nueva contraseña** ✅

## Troubleshooting

### "Error de autenticación SMTP"
- Verifica que `SENDER_EMAIL` y `SENDER_PASSWORD` sean correctos
- Para Gmail, asegúrate de usar la **contraseña de aplicación**, no la contraseña regular
- Para SendGrid, verifica que la API key sea válida

### "No recibe el email"
- Revisa la carpeta **Spam** del correo
- Verifica que el email está en la base de datos (tabla `users`)
- Revisa la consola del backend para ver si hay errores

### "El token no valida"
- Asegúrate de copiar el código **exactamente** como aparece
- Verifica que no ha pasado 1 hora desde que se generó
- En desarrollo, compara el token en la consola con el que ingresaste

## Variables de Entorno Recomendadas

Archivo `.env`:

```env
# ==================== Email ====================
# Desarrollo con Gmail
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=tu-email@gmail.com
SENDER_PASSWORD=abcd efgh ijkl mnop

# Producción con SendGrid
# SMTP_SERVER=smtp.sendgrid.net
# SMTP_PORT=587
# SENDER_EMAIL=apikey
# SENDER_PASSWORD=SG.tu-api-key
```

## Mejoras Futuras

- [ ] Enviar enlace directo en email (sin necesidad de copiar token)
- [ ] Templating de email más avanzado
- [ ] Intentos limitados de validación de token
- [ ] Logs de intentos fallidos
- [ ] Envío de email de confirmación después de cambiar contraseña

---

**Estado:** ✅ Implementado y listo para usar
**Seguridad:** 🔒 Tokens con expiración de 1 hora
**Flexibilidad:** 📧 Soporta cualquier proveedor SMTP
