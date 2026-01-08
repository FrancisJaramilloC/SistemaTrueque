"""
Servicio de Email
Maneja el envío de emails (recuperación de contraseña, notificaciones, etc)
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


class EmailService:
    """Servicio para envío de emails"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
    
    def send_password_reset_email(self, user_email: str, reset_token: str, user_name: str = "") -> bool:
        """
        Envía email de recuperación de contraseña
        
        Args:
            user_email: Email del usuario
            reset_token: Token de recuperación
            user_name: Nombre del usuario (opcional)
            
        Returns:
            bool: True si el email se envió exitosamente, False si falló
        """
        try:
            # Si no hay configuración de email, mostrar en consola para desarrollo
            if not self.sender_email or not self.sender_password:
                print(f"\n{'='*60}")
                print(f"[DESARROLLO - EMAIL NO CONFIGURADO]")
                print(f"{'='*60}")
                print(f"Email destinatario: {user_email}")
                print(f"Nombre usuario: {user_name}")
                print(f"Token de recuperación: {reset_token}")
                print(f"{'='*60}\n")
                return True
            
            # Crear mensaje
            message = MIMEMultipart("alternative")
            message["Subject"] = "Recupera tu contraseña en Truekealo"
            message["From"] = self.sender_email
            message["To"] = user_email
            
            # Contenido HTML del email
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Truekealo</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sistema de Intercambio</p>
                    </div>
                    
                    <div style="background: white; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none;">
                        <h2 style="color: #333; margin-top: 0;">¡Hola {user_name or 'Usuario'}!</h2>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Recibimos una solicitud para recuperar tu contraseña en Truekealo. 
                            Si no fuiste tú, puedes ignorar este email de forma segura.
                        </p>
                        
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
                            <p style="color: #999; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Tu código de recuperación:</p>
                            <p style="color: #333; font-size: 24px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                                {reset_token}
                            </p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            <strong>Paso a paso para recuperar tu contraseña:</strong>
                        </p>
                        <ol style="color: #666; line-height: 1.8;">
                            <li>Ve a la página de recuperación de contraseña</li>
                            <li>Ingresa el código anterior en el campo "Código de Recuperación"</li>
                            <li>Establece tu nueva contraseña</li>
                            <li>¡Listo! Podrás acceder con tu nueva contraseña</li>
                        </ol>
                        
                        <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            Este código expirará en 1 hora por razones de seguridad.
                        </p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 20px; text-align: center; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © 2024 Truekealo. Todos los derechos reservados.<br/>
                            Este es un email automático, no respondas a este mensaje.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            # Crear versión de texto plano
            text_content = f"""
            ¡Hola {user_name or 'Usuario'}!
            
            Recibimos una solicitud para recuperar tu contraseña en Truekealo.
            
            Tu código de recuperación es:
            {reset_token}
            
            Pasos para recuperar tu contraseña:
            1. Ve a la página de recuperación de contraseña
            2. Ingresa el código anterior en el campo "Código de Recuperación"
            3. Establece tu nueva contraseña
            4. ¡Listo! Podrás acceder con tu nueva contraseña
            
            Este código expirará en 1 hora por razones de seguridad.
            
            Si no solicitaste este cambio, puedes ignorar este email de forma segura.
            
            © 2024 Truekealo
            """
            
            # Adjuntar partes del mensaje
            message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))
            
            # Conectar a servidor SMTP y enviar
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            print(f"✅ Email de recuperación enviado a {user_email}")
            return True
            
        except smtplib.SMTPAuthenticationError:
            print(f"❌ Error de autenticación SMTP. Verifica SENDER_EMAIL y SENDER_PASSWORD")
            return False
        except smtplib.SMTPException as e:
            print(f"❌ Error al enviar email SMTP: {e}")
            return False
        except Exception as e:
            print(f"❌ Error al enviar email: {e}")
            return False


# Instancia global del servicio de email
email_service = EmailService()
