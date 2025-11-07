from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

# ESQUEMA PARA REGISTRO DE USUARIO
class UsuarioRegistro(BaseModel):
    email: EmailStr  # EmailStr valida automáticamente que sea un email real
    username: str = Field(
        ...,  # El ... significa que es obligatorio
        min_length=3,  # Mínimo 3 caracteres
        max_length=50,  # Máximo 50 caracteres
        description="Nombre de usuario único"
    )
    contrasena: str = Field(
        ...,
        min_length=8,  # Contraseña debe tener al menos 8 caracteres (seguridad básica)
        description="Contraseña del usuario (será hasheada antes de guardarse)"
    )
    
    @field_validator('contrasena')
    @classmethod
    def validar_contrasena_fuerte(cls, v: str) -> str:
        """
        Valida que la contraseña sea fuerte:
        - Al menos 8 caracteres
        - Al menos una mayúscula
        - Al menos una minúscula
        - Al menos un número
        - Al menos un carácter especial (!@#$%^&*)
        """
        if len(v) < 8:
            raise ValueError('Contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Contraseña debe contener al menos una mayúscula')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Contraseña debe contener al menos una minúscula')
        
        if not re.search(r'\d', v):
            raise ValueError('Contraseña debe contener al menos un número')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Contraseña debe contener al menos un carácter especial (!@#$%^&*)')
        
        return v
    
    persona_id: int = Field(
        ...,
        gt=0,  # persona_id debe ser un entero positivo
        description="ID de la persona asociada a este cliente"
    )
    
    # Ejemplo de configuración (opcional pero útil para documentación)
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "juan.perez@email.com",
                    "username": "juanperez",
                    "contrasena": "Password123!",
                    "persona_id": 1
                }
            ]
        }
    }


# ESQUEMA PARA RESPUESTA DE REGISTRO (sin exponer token de verificación)
class RegistroRespuesta(BaseModel):
    id: int
    email: str
    username: str
    estado: bool
    persona_id: int
    role: str
    is_verified: bool
    
    model_config = {
        "from_attributes": True  # Permite crear desde objetos de BD
    }


# ESQUEMA PARA LOGIN
class UsuarioLogin(BaseModel):
    username: str = Field(
        ...,
        min_length=1,
        description="Nombre de usuario"
    )
    contrasena: str = Field(
        ...,
        min_length=1,
        description="Contraseña del usuario"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "juanperez",
                    "contrasena": "Password123!"
                }
            ]
        }
    }


# ESQUEMA PARA LA RESPUESTA DEL TOKEN
class Token(BaseModel):
    access_token: str = Field(
        ...,
        description="El token JWT para autenticar futuras peticiones"
    )
    token_type: str = Field(
        default="bearer",
        description="Tipo de token (siempre será 'bearer' para JWT)"
    )

# ESQUEMA PARA LOS DATOS DEL USUARIO EN EL TOKEN
class TokenData(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None


# ESQUEMA PARA RESPUESTA DE USUARIO

class UsuarioRespuesta(BaseModel):
    id: int
    email: str
    username: str
    estado: bool
    persona_id: int
    role: str
    is_verified: bool
    
    model_config = {
        "from_attributes": True  # Permite crear desde objetos de BD
    }
