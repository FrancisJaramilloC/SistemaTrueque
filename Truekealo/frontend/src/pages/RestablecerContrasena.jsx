import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyToken, resetPassword } from '../services/passwordResetService';
import { showAlert } from '../utils/sweetAlert';

const RestablecerContrasena = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('token'); // 'token' o 'reset'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyToken(formData.token);
      setStep('reset');
      setError(''); // Limpiar error cuando se verifica exitosamente
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido o expirado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(formData.token, formData.newPassword);
      showAlert('success', '¡Éxito!', 'Tu contraseña ha sido restablecida correctamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al restablecer la contraseña';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Restablecer Contraseña</h2>
        <p className="auth-subtitle">
          {step === 'token' 
            ? 'Ingresa el código que recibiste por correo'
            : 'Ingresa tu nueva contraseña'
          }
        </p>

        {error && <div className="error-message">{error}</div>}

        {step === 'token' ? (
          <form onSubmit={handleVerifyToken} className="auth-form">
            <div className="form-group">
              <label htmlFor="token">Código de Recuperación</label>
              <input
                type="text"
                id="token"
                name="token"
                value={formData.token}
                onChange={handleChange}
                required
                placeholder="Pegra el código aquí"
                disabled={loading}
              />
              <p className="form-hint">Revisa tu correo para obtener el código</p>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="form-hint">Mínimo 8 caracteres</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}

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

export default RestablecerContrasena;
