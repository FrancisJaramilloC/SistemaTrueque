from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from config.db import conn
from src.model.cliente import clientes
from src.schema.auth_schema import UsuarioRegistro, UsuarioLogin, Token, UsuarioRespuesta
from src.auth.auth_utils import hash_password, verify_password, create_access_token
from src.auth.dependencies import get_current_user

# Crear el router
auth_router = APIRouter()


# RUTA DE REGISTRO
@auth_router.post("/registro",
    response_model=UsuarioRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario",
    description="""
    Registra un nuevo usuario en el sistema.
    Proceso:
    1. Valida que los datos sean correctos (Pydantic lo hace automáticamente)
    2. Verifica que el email y username no existan ya
    3. Hashea la contraseña (nunca guardamos contraseñas en texto plano)
    4. Crea el usuario en la base de datos
    5. Retorna la información del usuario (sin la contraseña)
    """
)
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        # Verificar que el email no esté registrado
        query_email = clientes.select().where(clientes.c.email == usuario.email)
        resultado_email = conn.execute(query_email).fetchone()
        if resultado_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El email '{usuario.email}' ya está registrado."
            )
        
        # Verificar que el username no esté registrado
        query_username = clientes.select().where(clientes.c.username == usuario.username)
        resultado_username = conn.execute(query_username).fetchone()
        if resultado_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El username '{usuario.username}' ya está en uso."
            )
        # Hashear la contraseña (nunca guardar contraseñas en texto plano)
        contrasena_hasheada = hash_password(usuario.contrasena)

        # Preparar los datos para insertar
        nuevo_cliente = {
            "email": usuario.email,
            "username": usuario.username,
            "contrasena": contrasena_hasheada,  # Guardamos el hash, no la contraseña real
            "estado": True,  # Por defecto el usuario está activo
            "persona_id": usuario.persona_id
        }

        # Insertar en la base de datos
        resultado = conn.execute(clientes.insert().values(nuevo_cliente))
        conn.commit()
        
        # Obtener el usuario creado para retornarlo
        usuario_creado = conn.execute(
            clientes.select().where(clientes.c.id == resultado.lastrowid)
        ).fetchone()

        # Convertir a diccionario y retornar (sin la contraseña)
        return {
            "id": usuario_creado.id,
            "email": usuario_creado.email,
            "username": usuario_creado.username,
            "estado": usuario_creado.estado,
            "persona_id": usuario_creado.persona_id
        }
        
    except HTTPException:
        # Re-lanzar las excepciones HTTP que creamos
        raise
    except IntegrityError as e:
        # Error de integridad de BD (ej: persona_id no existe)
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad: verifica que la persona_id exista."
        )
    except Exception as e:
        # Cualquier otro error
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}"
        )

# RUTA DE LOGIN
@auth_router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión",
    description="""
    Inicia sesión y obtiene un token JWT para autenticar futuras peticiones.
    
    Proceso:
    1. Busca el usuario por username
    2. Verifica que la contraseña sea correcta
    3. Verifica que el usuario esté activo (estado = True)
    4. Genera un token JWT con la información del usuario
    5. Retorna el token
    """
)
def login(credenciales: UsuarioLogin):
    try:
        # Buscar el usuario por username
        query = clientes.select().where(clientes.c.username == credenciales.username)
        usuario = conn.execute(query).fetchone()
        # Verificar que el usuario existe
        if not usuario:
            # SEGURIDAD: No especificamos si es el username o la contraseña incorrecta
            # Esto previene que un atacante sepa qué usernames existen
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Verificar que la contraseña sea correcta
        if not verify_password(credenciales.contrasena, usuario.contrasena):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verificar que el usuario esté activo
        if not usuario.estado:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo. Contacta al administrador.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Crear el token JWT
        token_data = {
            "sub": usuario.username,  # Identificador principal
            "email": usuario.email,    # Info adicional
            "user_id": usuario.id      # ID para consultas futuras
        }
        access_token = create_access_token(data=token_data)

        # Retornar el token
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al iniciar sesión: {str(e)}"
        )


# RUTA PROTEGIDA: OBTENER USUARIO ACTUAL
@auth_router.get("/me",
    response_model=UsuarioRespuesta,
    summary="Obtener información del usuario actual",
    description="""
    Obtiene la información del usuario que está autenticado.
    
    Esta ruta está protegida: requiere enviar un token válido en el header:
    Authorization: Bearer <token>
    
    Si el token es válido, retorna la información del usuario.
    Si no, retorna un error 401 (No autorizado).
    """
)
def obtener_usuario_actual(usuario_actual: dict = Depends(get_current_user)):
    try:
        # Obtener el ID del usuario del token
        user_id = usuario_actual.get("user_id")
        # Buscar el usuario en la BD
        query = clientes.select().where(clientes.c.id == user_id)
        usuario = conn.execute(query).fetchone()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado."
            )
        # Retornar la información (sin contraseña)
        return {
            "id": usuario.id,
            "email": usuario.email,
            "username": usuario.username,
            "estado": usuario.estado,
            "persona_id": usuario.persona_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuario: {str(e)}"
        )
