#  Guía de Instalación - Truekealo

## ✅ Requisitos Previos

### Software Requerido
- **Python 3.9 o superior** - [Descargar](https://www.python.org/downloads/)
- **MariaDB 10.x o MySQL 8.0** - [Descargar](https://mariadb.org/download/)
- **Git** - [Descargar](https://git-scm.com/)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

### Verificar instalación
```bash
python --version        # Debe ser 3.9+
mysql --version         # Debe ser 5.7+ o MariaDB 10+
git --version           # Debe estar instalado
```

---

## 1️⃣ Configuración de Base de Datos

### Opción A: Windows (MySQL/MariaDB GUI)

1. Abrir **MySQL Workbench** o **HeidiSQL**
2. Conectar con usuario `root`
3. Ejecutar este script SQL:

```sql
-- Crear base de datos
CREATE DATABASE truekealo_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'truekealo_user'@'localhost' 
IDENTIFIED BY 'tu_password_super_seguro_2025';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON truekealo_db.* 
TO 'truekealo_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar
SHOW GRANTS FOR 'truekealo_user'@'localhost';
```

### Opción B: Línea de Comandos (Recomendado)

```bash
# 1. Conectar a MariaDB/MySQL
mysql -u root -p
# (Ingresa tu contraseña de root)

# 2. Pegar el script SQL anterior y ejecutar

# 3. Verificar
mysql -u truekealo_user -p truekealo_db -e "SELECT 1;"
# (Debería mostrar | 1 | sin errores)

# 4. Salir
exit
```

### Verificación Rápida
```bash
# En PowerShell/Terminal
mysql -u truekealo_user -p -h localhost truekealo_db -e "SELECT 'Conexión exitosa!' AS mensaje;"
# Ingresa: tu_password_super_seguro_2025
```

---

## 2️⃣ Configuración del Backend

### Paso 1: Navegar al directorio

```bash
cd Truekealo/backend
```

### Paso 2: Crear entorno virtual

**Windows (PowerShell):**
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1

# Si hay error de permisos:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Luego intenta de nuevo
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

✓ Deberías ver `(venv)` al inicio de la línea de comandos

### Paso 3: Crear archivo .env

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# O crear manualmente
echo. > .env
```

### Paso 4: Editar .env

Abre `Truekealo/backend/.env` con un editor de texto (VS Code, Notepad++, etc.) y reemplaza:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=truekealo_user
DB_PASSWORD=tu_password_super_seguro_2025
DB_NAME=truekealo_db
```

**Nota:** Usa las mismas credenciales que creaste en la BD

### Paso 5: Instalar dependencias

```bash
# Asegúrate de estar en el directorio backend con venv activado
pip install -r requirements.txt
```

Debería mostrar mensajes como:
```
Collecting fastapi==0.109.0
...
Successfully installed fastapi-0.109.0 sqlalchemy-2.0.25 ...
```

### Paso 6: Inicializar base de datos

```bash
# Las tablas se crean automáticamente al iniciar el servidor
# Pero puedes verificar ejecutando:
python -c "from app.database import init_db; init_db(); print('BD inicializada')"
```

### Paso 7: Iniciar el servidor

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Debería mostrar:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
```

✓ Backend está listo: http://localhost:8000

---

## 3️⃣ Configuración del Frontend

### Opción A: Servidor Python (Más fácil)

```bash
# En otra terminal (sin cerrar la del backend)
cd Truekealo/frontend

# Windows
python -m http.server 5500

# Linux/Mac
python3 -m http.server 5500
```

Debería mostrar:
```
Serving HTTP on 0.0.0.0 port 5500 ...
```

✓ Frontend disponible: http://localhost:5500

### Opción B: Live Server (VS Code)

1. Instalar extensión "Live Server" (Ritwick Dey)
2. Click derecho en `Truekealo/frontend/templates/login.html`
3. "Open with Live Server"

### Opción C: Node.js / npm

```bash
cd Truekealo/frontend
npx http-server -p 5500
```

---

## 4️⃣ Verificación Completa

Ejecutar todos estos checks:

### ✅ Backend

```bash
# Terminal 1 - Backend activo
curl http://localhost:8000/health
# Debería retornar: {"status":"healthy","version":"1.0.0"}

curl http://localhost:8000/api/docs
# Debería abrir documentación Swagger en navegador
```

### ✅ Base de Datos

```bash
# Verificar conexión
mysql -u truekealo_user -p -h localhost truekealo_db -e "SHOW TABLES;"
# Debería listar: users, articulos, propuestas, mensajes
```

### ✅ Frontend

Abrir en navegador:
```
http://localhost:5500
```

Debería cargar la página de login sin errores en la consola.

---

## 5️⃣ Primer Uso

### 1. Registrar Usuario

```
URL: http://localhost:5500/templates/crear-cuenta.html
```

Datos de prueba:
- Email: `usuario@example.com`
- Nombre: `Juan Pérez`
- Contraseña: `MiPassword123` (mínimo 8 caracteres, 1 número, 1 mayúscula)
- Confirmar: `MiPassword123`

### 2. Iniciar Sesión

```
URL: http://localhost:5500/templates/login.html
```

Usar credenciales del usuario registrado:
- Email: `usuario@example.com`
- Contraseña: `MiPassword123`

### 3. Crear Artículo

```
URL: http://localhost:5500/templates/publicar.html
```

Completar formulario y publicar.

### 4. Explorar Artículos

```
URL: http://localhost:5500/templates/explorar.html
```

---

## 🔧 Solución de Problemas

### Error: "No module named 'app'"

```bash
# Verifica que estés en el directorio correcto
cd Truekealo/backend

# Verifica que venv esté activado
# Windows: (venv) debe aparecer al inicio
# Linux/Mac: (venv) debe aparecer al inicio

# Reinstala dependencias
pip install -r requirements.txt
```

### Error: "Connection refused" BD

```bash
# Verificar que MariaDB esté corriendo
# Windows: Verificar en Servicios (services.msc)
# Linux: sudo systemctl status mariadb
# Mac: brew services list | grep mariadb

# Iniciar MariaDB si está detenido
# Windows: net start MariaDB
# Linux: sudo systemctl start mariadb
# Mac: brew services start mariadb

# Verificar credenciales en .env
# DB_USER=truekealo_user
# DB_PASSWORD=tu_password_super_seguro_2025
```

### Error: "CORS error" en Frontend

```
Las peticiones del frontend al backend están siendo bloqueadas.
```

✓ Verificar que el backend está corriendo en `http://localhost:8000`

✓ Verificar que el archivo `api-client.js` tenga:
```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api/v1'  // ✓ Correcto
};
```

### Puerto 8000 o 5500 ya en uso

```bash
# Cambiar puerto del backend
python -m uvicorn app.main:app --reload --port 8001

# Cambiar puerto del frontend
python -m http.server 5501
```

Luego actualizar en `api-client.js`:
```javascript
BASE_URL: 'http://localhost:8001/api/v1'
```

### "No such file or directory" .env

```bash
# Asegúrate de copiar el archivo
cd Truekealo/backend
copy .env.example .env        # Windows
cp .env.example .env          # Linux/Mac
```

---

## 📱 Acceso Remoto (Desarrollo)

Si quieres acceder desde otra máquina en la red:

### Backend

```bash
# Iniciar escuchando en 0.0.0.0
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Acceder desde otra máquina
http://192.168.1.xxx:8000  # Reemplaza xxx con tu IP
```

### Frontend

```bash
# Verificar tu IP local
ipconfig                    # Windows
ifconfig                    # Linux/Mac

# Acceder desde otra máquina
http://192.168.1.xxx:5500  # Reemplaza xxx con tu IP
```

---

## 🐳 Docker (Opcional Avanzado)

Para ejecutar en contenedores:

```bash
# Crear Dockerfile en Truekealo/backend
# Crear docker-compose.yml en raíz

docker-compose up
```

---

## 📊 Diagrama de Setup

```
Usuario
  │
  ├─→ Frontend (http://localhost:5500)
  │   └─→ api-client.js
  │       └─→ Backend (http://localhost:8000)
  │           ├─→ Validación Pydantic
  │           ├─→ Autenticación JWT
  │           └─→ SQLAlchemy ORM
  │               └─→ MariaDB 10.x (localhost:3306)
  │                   ├─ users
  │                   ├─ articulos
  │                   ├─ propuestas
  │                   └─ mensajes
  │
  └─→ Documentación API (http://localhost:8000/api/docs)
```

---

## ✨ Checklist de Instalación

```
[ ] Python 3.9+ instalado
[ ] MariaDB corriendo
[ ] Base de datos 'truekealo_db' creada
[ ] Usuario 'truekealo_user' creado
[ ] Backend clonado
[ ] Entorno virtual creado y activado
[ ] Dependencias instaladas (requirements.txt)
[ ] Archivo .env configurado correctamente
[ ] Backend iniciado sin errores
[ ] Frontend accesible en http://localhost:5500
[ ] Swagger accesible en http://localhost:8000/api/docs
[ ] Test de conexión BD exitoso
[ ] Registro de usuario funciona
[ ] Login funciona
```

---

## 🚀 Próximos Pasos

1. **Leer documentación:** [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md)
2. **Entender arquitectura:** [Diagramas C4](docs/architecture/)
3. **Explorar API:** http://localhost:8000/api/docs
4. **Crear primer artículo:** http://localhost:5500

---

## 📚 Referencias

- [FastAPI Installation](https://fastapi.tiangolo.com/deployment/)
- [MariaDB Docker](https://hub.docker.com/_/mariadb)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)
- [Troubleshooting Guide](DOCUMENTACION_TECNICA.md#-resolución-de-problemas)

---

**¡Instalación completada! 🎉**

Última actualización: 2 de enero de 2025
