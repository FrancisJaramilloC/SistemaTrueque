# Análisis de Errores - Módulo de Mensajes

## 🔴 Error Principal: Maximum Call Stack Size Exceeded

### Causa Raíz Identificada
**Recursión infinita en `safeToast` (api-client.js, líneas 18 y 25)**

```javascript
// ❌ CÓDIGO ERRÓNEO (causaba recursión infinita)
const safeToast = {
    success: (message) => {
        if (typeof Toast !== 'undefined') {
            safeToast.success(message);  // ← ¡Se llama a sí mismo!
        }
    }
}
```

### Cómo se Manifestaba
1. Usuario accede a mensajes.html
2. La página intenta cargar conversaciones → error 401
3. `api-client.js` intenta mostrar error con `safeToast.error()`
4. `safeToast.error()` llama a `safeToast.error()` → bucle infinito
5. Stack overflow después de ~15,000 llamadas recursivas

### Solución Implementada
```javascript
// ✅ CÓDIGO CORREGIDO
const safeToast = {
    success: (message) => {
        if (typeof Toast !== 'undefined' && Toast.success) {
            Toast.success(message);  // ← Llama a Toast, no a sí mismo
        } else {
            console.log('✅', message);
        }
    }
}
```

---

## 🔴 Error Secundario: 401 Unauthorized

### Posibles Causas

#### 1. Token Expirado (Causa Más Probable)
**Síntomas:**
- Error 401 en múltiples endpoints simultáneamente
- Usuario previamente autenticado deja de tener acceso
- El token tiene más de 30 minutos (tiempo de expiración por defecto)

**Cómo Identificarlo:**
```javascript
// En consola del navegador:
const token = localStorage.getItem('access_token');
console.log(token);

// Decodificar manualmente (sin verificar firma):
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expira:', new Date(payload.exp * 1000));
console.log('¿Expirado?', Date.now() > payload.exp * 1000);
```

**Solución:**
- El código ya implementa redirección automática al login en api-client.js
- Usuario debe iniciar sesión nuevamente

#### 2. Token Inválido o Corrupto
**Síntomas:**
- 401 inmediatamente después del login
- Token tiene formato incorrecto (no es JWT válido)

**Cómo Identificarlo:**
```bash
# Verificar formato del token en backend logs
# Debe tener 3 partes separadas por puntos: header.payload.signature
```

**Solución:**
```javascript
// Limpiar localStorage y volver a autenticar
localStorage.clear();
window.location.href = '/templates/login.html';
```

#### 3. Usuario Eliminado o Deshabilitado
**Síntomas:**
- Token válido pero usuario no existe en BD
- Error 401 con mensaje específico del backend

**Cómo Identificarlo:**
```python
# Verificar en backend logs (security.py):
# "Could not validate credentials"
# "User not found"
```

#### 4. Configuración CORS Incorrecta
**Síntomas:**
- 401 solo en ciertos endpoints
- Funciona en Postman pero no en navegador

**Cómo Identificarlo:**
```javascript
// Verificar headers en Network tab:
// - Origin: http://localhost:5500
// - Access-Control-Allow-Origin debe coincidir
```

---

## 🔧 Estrategia de Diagnóstico

### Paso 1: Verificar Estado del Token
```javascript
// Ejecutar en consola del navegador
const token = localStorage.getItem('access_token');
if (!token) {
    console.error('❌ No hay token - usuario no autenticado');
} else {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('❌ Token malformado');
        } else {
            const payload = JSON.parse(atob(parts[1]));
            const expired = Date.now() > payload.exp * 1000;
            console.log('Token:', expired ? '❌ Expirado' : '✅ Válido');
            console.log('Expira en:', new Date(payload.exp * 1000));
        }
    } catch (e) {
        console.error('❌ Error decodificando token:', e);
    }
}
```

### Paso 2: Verificar Conectividad Backend
```javascript
// Test endpoint público
fetch('http://localhost:8000/api/v1/auth/test')
    .then(r => r.json())
    .then(d => console.log('✅ Backend activo:', d))
    .catch(e => console.error('❌ Backend inaccesible:', e));
```

### Paso 3: Verificar Headers de Autenticación
```javascript
// Inspeccionar request en Network tab
// Debe incluir: Authorization: Bearer eyJhbGc...
```

### Paso 4: Revisar Logs del Backend
```bash
# Terminal donde corre uvicorn
# Buscar líneas con "401" o "Unauthorized"
# Verificar si llega el token al backend
```

---

## 🛠️ Ajustes Realizados

### Frontend (api-client.js)

1. **Corrección de recursión infinita en safeToast**
```javascript
// Cambio: safeToast.error() → Toast.error()
```

2. **Manejo anticipado de errores 401**
```javascript
if (response.status === 401) {
    console.warn('Token expirado, cerrando sesión...');
    TokenManager.removeToken();
    window.location.href = '/templates/login.html';
    throw new APIError('Sesión expirada', 401, {});
}
```

3. **Límite de intentos en wait loops**
```javascript
// mensajes.html y dashboard.html
let attempts = 0;
while (!window.TruekealoAPI && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
}
```

### Frontend (mensajes.html)

4. **Guards para API no disponible**
```javascript
if (!TruekealoAPI?.Mensajes?.getConversaciones) {
    console.debug('API no disponible');
    return;
}
```

5. **Sincronización segura de contadores**
```javascript
async function syncUnreadCount() {
    try {
        if (!TruekealoAPI?.Mensajes?.getUnreadCount) {
            console.debug('Mensajes API no disponible');
            return; // ← Early return en lugar de throw
        }
        // ... resto del código
    } catch (error) {
        console.error('Error sincronizando:', error);
        // No re-throw para evitar loops
    }
}
```

---

## ✅ Validación Post-Corrección

### Checklist de Pruebas

1. **Recargar página con Ctrl+F5**
   - Debe eliminar código JavaScript cacheado
   - Verificar en Network tab que se descarga nuevo api-client.js

2. **Limpiar localStorage**
   ```javascript
   localStorage.clear();
   ```

3. **Iniciar sesión nuevamente**
   - Debe generar nuevo token válido
   - Verificar que se guarda en localStorage

4. **Verificar dashboard**
   - Contadores deben mostrar valores reales
   - No debe haber errores en consola

5. **Acceder a mensajes**
   - Debe cargar conversaciones sin errores
   - No debe haber stack overflow
   - Contador de mensajes debe actualizarse

### Métricas de Éxito
- ✅ Sin errores en consola
- ✅ Contadores muestran valores correctos
- ✅ Navegación fluida entre páginas
- ✅ Mensajes se envían y reciben correctamente
- ✅ Redirección automática al expirar token

---

## 🚀 Mejoras Futuras Recomendadas

### Backend
1. **Refresh tokens** para renovar sesión sin re-login
2. **Logging estructurado** con información de debug
3. **Rate limiting** para prevenir abuso de endpoints

### Frontend
4. **Retry automático** en errores de red transitorios
5. **Indicador visual** de conectividad (online/offline)
6. **Notificaciones toast** persistentes y accesibles
7. **Service Worker** para funcionalidad offline básica

### Monitoreo
8. **Error tracking** (Sentry, LogRocket)
9. **Analytics** de eventos de usuario
10. **Health checks** automáticos del backend
