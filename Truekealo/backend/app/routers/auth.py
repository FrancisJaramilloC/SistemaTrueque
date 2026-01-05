"""
Router de Autenticación
Endpoints para registro, login y gestión de autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en el sistema
    
    Args:
        user_data: Datos del usuario a registrar
        db: Sesión de base de datos
        
    Returns:
        UserResponse: Usuario creado
        
    Raises:
        HTTPException: Si el email ya está registrado
    """
    # Verificar si el email ya existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        nombre_completo=user_data.nombre_completo,
        hashed_password=hashed_password,
        telefono=user_data.telefono,
        ubicacion=user_data.ubicacion
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Autentica un usuario y devuelve un token JWT
    
    Args:
        user_credentials: Credenciales del usuario (email y password)
        db: Sesión de base de datos
        
    Returns:
        Token: Token de acceso JWT y datos del usuario
        
    Raises:
        HTTPException: Si las credenciales son inválidas
    """
    # Buscar usuario por email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login/form", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint compatible con OAuth2PasswordRequestForm
    Permite login con formularios estándar de OAuth2
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtiene la información del usuario actual
    
    Args:
        current_user: Usuario autenticado
        
    Returns:
        UserResponse: Datos del usuario actual
    """
    return current_user


@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cambia la contraseña del usuario actual
    
    Args:
        current_password: Contraseña actual del usuario
        new_password: Nueva contraseña
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        dict: Mensaje de éxito
        
    Raises:
        HTTPException: Si la contraseña actual es incorrecta
    """
    # Verificar contraseña actual
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )
    
    # Validar nueva contraseña
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 8 caracteres"
        )
    
    # Actualizar contraseña
    current_user.hashed_password = get_password_hash(new_password)
    db.add(current_user)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}


@router.post("/enable-2fa")
async def enable_2fa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Habilita la autenticación de dos factores (2FA)
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        dict: QR code y backup codes para 2FA
        
    Nota: Esta es una implementación básica.
    En producción, usar bibliotecas como pyotp o qrcode.
    """
    import secrets
    
    # Generar código secreto para 2FA (en producción usar pyotp)
    secret = secrets.token_urlsafe(32)
    
    # Guardar estado 2FA en el usuario (requiere campo en modelo User)
    # current_user.two_factor_enabled = True
    # current_user.two_factor_secret = secret
    # db.add(current_user)
    # db.commit()
    
    return {
        "message": "2FA habilitado correctamente",
        "secret": secret,
        "note": "Guarda este código en un lugar seguro"
    }


@router.post("/disable-2fa")
async def disable_2fa(
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deshabilita la autenticación de dos factores (2FA)
    
    Args:
        password: Contraseña del usuario para confirmación
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        dict: Mensaje de éxito
    """
    # Verificar contraseña
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña incorrecta"
        )
    
    # Deshabilitar 2FA (requiere campo en modelo User)
    # current_user.two_factor_enabled = False
    # db.add(current_user)
    # db.commit()
    
    return {"message": "2FA deshabilitado correctamente"}


@router.post("/request-password-reset")
async def request_password_reset(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Solicita un token para recuperación de contraseña
    
    Args:
        email: Email del usuario
        db: Sesión de base de datos
        
    Returns:
        dict: Mensaje indicando que se enviará un email (por seguridad)
        
    Nota: En producción, implementar envío real de email con boto3/SendGrid
    """
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Generar token de recuperación (en producción guardarlo en BD con TTL)
        import secrets
        reset_token = secrets.token_urlsafe(32)
        
        # TODO: Guardar token en tabla de recuperación de contraseña
        # TODO: Enviar email con link: /recuperar-contrasena?token={reset_token}
        
        print(f"[DEBUG] Reset token for {email}: {reset_token}")
    
    # Por seguridad, siempre devolver el mismo mensaje
    return {"message": "Si el email existe, recibirás un enlace para recuperar tu contraseña"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Restablece la contraseña usando un token de recuperación
    
    Args:
        token: Token de recuperación de contraseña
        new_password: Nueva contraseña
        db: Sesión de base de datos
        
    Returns:
        dict: Mensaje de éxito
        
    Raises:
        HTTPException: Si el token es inválido o ha expirado
    """
    # TODO: Validar token contra tabla de recuperación
    # TODO: Verificar que el token no haya expirado
    
    # Por ahora, retornar error indicando que la funcionalidad no está completamente implementada
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Funcionalidad en desarrollo. Por favor usa 'Cambiar contraseña' en tu perfil."
    )

    return current_user
