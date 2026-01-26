# 🔄 Truekealo - Sistema de Intercambio de Artículos

Sistema web completo de trueque (intercambio de artículos) desarrollado con FastAPI y Vanilla JavaScript.

## 🚀 Características

- ✅ Sistema de autenticación JWT (registro, login, recuperación de contraseña)
- 📦 Gestión de artículos con imágenes
- 💬 Sistema de mensajería entre usuarios
- 🔄 Propuestas de intercambio
- 🌓 Modo oscuro/claro
- ♿ Herramientas de accesibilidad integradas
- 📱 Diseño responsive
- 🔒 Seguridad con hash de contraseñas (bcrypt)

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para base de datos
- **MariaDB/MySQL** - Base de datos relacional
- **Pydantic** - Validación de datos
- **JWT** - Autenticación con tokens
- **Uvicorn** - Servidor ASGI

### Frontend
- **HTML5 + CSS3** - Estructura y estilos
- **Vanilla JavaScript** - Lógica del cliente
- **Tailwind CSS** - Framework CSS utility-first
- **Material Symbols** - Iconografía

## 📁 Estructura del Proyecto

```
Truekealo/
├── backend/                 # Backend FastAPI
│   ├── app/
│   │   ├── core/           # Configuración y seguridad
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routers/        # Endpoints de la API
│   │   └── schemas/        # Esquemas Pydantic
│   ├── tests/              # Tests unitarios
│   ├── scripts/            # Scripts de utilidad
│   └── requirements.txt    # Dependencias Python
├── frontend/               # Frontend estático
│   ├── assets/            # CSS, JS, imágenes
│   ├── templates/         # Páginas HTML
│   └── includes/          # Componentes reutilizables
├── docs/                  # Documentación
├── uploads/               # Archivos subidos
└── .env.example           # Plantilla de variables de entorno
```

## 🔧 Instalación

### Requisitos Previos
- Python 3.8+
- MariaDB/MySQL
- Navegador web moderno

### 1. Clonar el repositorio
```bash
git clone [url-del-repo]
cd Truekealo
```

### 2. Configurar la base de datos
```sql
CREATE DATABASE truekealo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**IMPORTANTE:** Genera una SECRET_KEY segura:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Instalar dependencias del backend
```bash
cd backend
pip install -r requirements.txt
```

### 5. Inicializar la base de datos
```bash
python init_db.py
```

### 6. Ejecutar el servidor
```bash
# Desarrollo
uvicorn app.main:app --reload --port 8000

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 7. Abrir el frontend
```bash
# Usando Live Server (VS Code) o cualquier servidor HTTP
# Apuntar a: frontend/index.html
```

O con Python:
```bash
cd frontend
python -m http.server 5500
```

Acceder a: `http://localhost:5500`

## 🔐 Seguridad

- **NO** commitear el archivo `.env` al repositorio
- Cambiar la `SECRET_KEY` en producción
- Usar contraseñas seguras para la base de datos
- Configurar CORS apropiadamente para producción
- Mantener las dependencias actualizadas

## 📚 Documentación

- **API Docs (Swagger):** `http://localhost:8000/api/docs`
- **ReDoc:** `http://localhost:8000/api/redoc`
- **Documentación adicional:** Ver carpeta `/docs`

## 🧪 Testing

```bash
cd backend
pytest tests/
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Autores

- Desarrollo inicial: [Tu nombre/equipo]

## 🐛 Reportar Bugs

Para reportar bugs o solicitar características, por favor abre un issue en GitHub.

---

**Nota:** Este es un proyecto educativo desarrollado como parte del curso de Desarrollo de Software.
