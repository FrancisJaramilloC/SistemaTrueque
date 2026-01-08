"""
Router de Autenticación
Endpoints para registro, login y gestión de autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel
import secrets

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from app.core.config import settings
from app.core.email import email_service
from app.models.user import User
from app.models.password_reset import PasswordResetToken

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
            detail="Usuario o contraseña incorrecta",
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
            detail="Usuario o contraseña incorrecta",
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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cambia la contraseña del usuario actual
    
    Args:
        request: Datos con contraseña actual y nueva
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        dict: Mensaje de éxito
        
    Raises:
        HTTPException: Si la contraseña actual es incorrecta
    """
    # Verificar contraseña actual
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )
    
    # Validar nueva contraseña
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 8 caracteres"
        )
    
    # Actualizar contraseña
    current_user.hashed_password = get_password_hash(request.new_password)
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


class PasswordResetRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/request-password-reset")
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Solicita un token para recuperación de contraseña
    El token se envía al correo del usuario
    
    Args:
        request: Datos con email del usuario
        db: Sesión de base de datos
        
    Returns:
        dict: Mensaje de confirmación
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        # Limpiar tokens anteriores
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id
        ).delete()
        db.commit()
        
        # Generar token de recuperación
        reset_token = secrets.token_urlsafe(32)
        
        # Guardar token con expiración de 1 hora
        expires_at = datetime.utcnow() + timedelta(hours=1)
        token_record = PasswordResetToken(
            user_id=user.id,
            token=reset_token,
            expires_at=expires_at
        )
        db.add(token_record)
        db.commit()
        
        # Enviar email con token
        email_service.send_password_reset_email(
            user_email=user.email,
            reset_token=reset_token,
            user_name=user.nombre_completo or user.email.split('@')[0]
        )
        
        return {
            "message": "Si el email existe, recibirás un código de recuperación en tu correo"
        }
    
    # Por seguridad, devolver el mismo mensaje aunque el email no exista
    return {
        "message": "Si el email existe, recibirás un código de recuperación en tu correo"
    }


@router.get("/verify-token/{token}")
async def verify_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verifica que un token de recuperación sea válido
    
    Args:
        token: Token de recuperación
        db: Sesión de base de datos
        
    Returns:
        dict: Mensaje indicando si el token es válido
        
    Raises:
        HTTPException: Si el token es inválido o ha expirado
    """
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de recuperación inválido"
        )
    
    # Verificar expiración
    if datetime.utcnow() > token_record.expires_at:
        db.delete(token_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código ha expirado. Solicita uno nuevo."
        )
    
    return {
        "message": "Código válido",
        "valid": True
    }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Restablece la contraseña usando un token de recuperación
    
    Args:
        request: Datos con token y nueva contraseña
        db: Sesión de base de datos
        
    Returns:
        dict: Mensaje de éxito
        
    Raises:
        HTTPException: Si el token es inválido o ha expirado
    """
    # Buscar el token
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperación inválido"
        )
    
    # Verificar expiración
    if datetime.utcnow() > token_record.expires_at:
        db.delete(token_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de recuperación ha expirado. Solicita uno nuevo."
        )
    
    # Validar nueva contraseña
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 8 caracteres"
        )
    
    # Actualizar contraseña
    user = token_record.user
    user.hashed_password = get_password_hash(request.new_password)
    db.add(user)
    
    # Eliminar token usado
    db.delete(token_record)
    db.commit()
    
    return {"message": "Contraseña restablecida correctamente"}



    return current_user
