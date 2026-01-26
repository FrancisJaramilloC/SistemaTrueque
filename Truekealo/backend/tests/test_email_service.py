"""
Script de prueba para validar el servicio de email
Verifica que el servicio de email funciona correctamente
"""
import sys
from pathlib import Path

# Añadir el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.email import email_service

def test_email_service():
    """Prueba el servicio de email"""
    
    print("=" * 60)
    print("PRUEBA DE SERVICIO DE EMAIL")
    print("=" * 60)
    
    # Datos de prueba
    test_email = "usuario@example.com"
    test_token = "AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
    test_name = "Juan Pérez"
    
    print(f"\n📧 Enviando email de prueba...")
    print(f"   Email destino: {test_email}")
    print(f"   Nombre usuario: {test_name}")
    print(f"   Token: {test_token}")
    
    # Enviar email de prueba
    success = email_service.send_password_reset_email(
        user_email=test_email,
        reset_token=test_token,
        user_name=test_name
    )
    
    if success:
        print("\n✅ Email procesado exitosamente")
        print("\nSi está configurado SMTP:")
        print("   → El email se envió a la bandeja de entrada")
        print("\nSi NO está configurado SMTP:")
        print("   → Los datos se muestran en la consola para desarrollo")
        print("   → Esto es normal en desarrollo")
    else:
        print("\n❌ Error al procesar el email")
        print("   Verifica la configuración SMTP en .env")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_email_service()
