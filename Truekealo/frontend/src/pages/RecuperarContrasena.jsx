import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/passwordResetService';
import { showAlert } from '../utils/sweetAlert';

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
      
      // Redirigir a la página de reset después de 2 segundos
      setTimeout(() => {
        navigate('/restablecer-contrasena');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al solicitar recuperación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-icon">✓</div>
          <h2>Código Enviado</h2>
          <p className="auth-subtitle">
            Se ha enviado un código de recuperación a <strong>{email}</strong>
          </p>
          <p className="auth-info">
            Por favor, revisa tu bandeja de entrada (y carpeta de spam) para obtener tu código de recuperación.
          </p>
          <p className="auth-info">
            Serás redirigido automáticamente para ingresar el código...
          </p>
          <Link to="/restablecer-contrasena" className="btn btn-primary">
            Ir a Restablecer Contraseña
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Contraseña</h2>
        <p className="auth-subtitle">Ingresa tu correo para recibir un código de recuperación</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="link-secondary">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
