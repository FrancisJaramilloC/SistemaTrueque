# SistemaTrueque
Repositorio dedicado el proyecto de la materia Desarrollo de Plataformas

Requisitos Funcionales 

<img width="597" height="762" alt="image" src="https://github.com/user-attachments/assets/62956b16-b217-4a61-ab4e-b92a3e57f8f7" />

Requisitos No funcionales 

<img width="881" height="760" alt="image" src="https://github.com/user-attachments/assets/6d71b647-a00c-4eed-854d-ec16e554db70" />

Módelo C4 NIVEL 1
Diagrama de Contexto

<img width="873" height="815" alt="image" src="https://github.com/user-attachments/assets/69e91081-ddb1-48bb-b380-217452a36dc6" />

Módelo C4 NIVEL 2
Diagrama de Contenedor

<img width="3070" height="995" alt="structurizr-Container-001" src="https://github.com/user-attachments/assets/f873d4f2-2dd1-4810-bd71-25b73cba7aeb" />

Módelo C4 NIVEL 3
Diagrama de Componentes

![Imagen de WhatsApp 2025-10-26 a las 22 05 00_1c2eb407](https://github.com/user-attachments/assets/3c2eccf1-b01d-40f7-855a-1a5df9620c11)

Módelo C4 NIVEL 
Diagrama de Codigo 
<img width="954" height="482" alt="image" src="https://github.com/user-attachments/assets/38e52c7c-f0d4-44d9-b9c5-5615f2d61916" />


## Cómo ejecutar el backend (FastAPI)

Sigue estos pasos para correr la API con autenticación JWT y CORS:

1) Crear archivo de variables de entorno

- Copia el archivo `.env.example` a `.env` y ajusta tus valores locales (DB, SECRET_KEY, etc.)

2) Instalar dependencias

- Dentro del proyecto, instala las dependencias del backend:
	- pip install -r requirements.txt

3) Levantar el servidor

- Ejecuta:
	- uvicorn main:app --reload
	- La API quedará en: http://localhost:8000
	- Documentación interactiva: http://localhost:8000/docs

4) Probar autenticación (flujo completo)

- Endpoints principales:
	- POST /api/auth/registro → Crea usuario (requiere persona_id existente)
	- POST /api/auth/login → Devuelve access_token (JWT)
	- GET /api/auth/me → Requiere token (Authorization: Bearer <token>)

Más detalles de seguridad y arquitectura en `DOCUMENTACION_SEGURIDAD.md`.

### Troubleshooting: Error de base de datos (Access denied)

Si ves `Access denied for user 'root'@'localhost'`:

1) Verifica `.env`

- DB_USER, DB_PASSWORD, DB_HOST (sug: 127.0.0.1), DB_PORT (3307 por defecto del proyecto), DB_NAME.
- Si tu root no tiene contraseña, deja `DB_PASSWORD=` vacío.
- Puedes forzar driver alternativo usando `DB_DRIVER=pymysql`.

2) Crea un usuario dedicado y dale permisos (recomendado)

Ejecuta en tu cliente MariaDB (ajusta puerto si no es 3307):

```sql
CREATE DATABASE IF NOT EXISTS sistema_trueques CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'trueque'@'localhost' IDENTIFIED BY 'TuPass!123';
GRANT ALL PRIVILEGES ON sistema_trueques.* TO 'trueque'@'localhost';
FLUSH PRIVILEGES;
```

Luego en `.env`:

```
DB_USER=trueque
DB_PASSWORD=TuPass!123
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=sistema_trueques
```

3) Si tu servidor usa otro puerto (ej. 3306), cambia `DB_PORT`.


