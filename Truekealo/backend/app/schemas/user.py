"""
Schemas de Usuario
Define los esquemas Pydantic para validación de datos de entrada/salida
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


# ==================== Schemas Base ====================
class UserBase(BaseModel):
    """Schema base con campos comunes"""
    email: EmailStr
    nombre_completo: str = Field(..., min_length=2, max_length=255)


class UserCreate(UserBase):
    """Schema para crear un nuevo usuario"""
    password: str = Field(..., min_length=8, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    ubicacion: Optional[str] = Field(None, max_length=255)
    
    @validator('password')
    def validate_password(cls, v):
        """Valida que la contraseña tenga mínimo 8 caracteres"""
        # Solo verificar longitud, permitir cualquier combinación de caracteres
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v


class UserUpdate(BaseModel):
    """Schema para actualizar un usuario"""
    nombre_completo: Optional[str] = Field(None, min_length=2, max_length=255)
    telefono: Optional[str] = Field(None, max_length=20)
    ubicacion: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = None


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema de respuesta con datos del usuario"""
    id: int
    telefono: Optional[str]
    ubicacion: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Schema con información sensible (solo para uso interno)"""
    hashed_password: str


# ==================== Schemas de Autenticación ====================
class Token(BaseModel):
    """Schema de respuesta de token JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema de datos decodificados del token"""
    user_id: Optional[int] = None
