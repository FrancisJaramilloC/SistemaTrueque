import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, enable2FA, disable2FA } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { showConfirm, showToast, alertas } from '../utils/sweetAlert';

const Configuracion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('password');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.is_2fa_enabled || false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      showToast('success', 'Contraseña actualizada correctamente');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cambiar la contraseña');
      alertas.errorGeneral(err.response?.data?.detail || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await enable2FA();
      setTwoFASecret(data.secret);
      setTwoFAEnabled(true);
      setSuccess('Escanea el código QR con tu aplicación de autenticación');
    } catch (err) {
      setError('Error al habilitar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const confirmed = await showConfirm(
      'Desactivar Autenticación de Dos Factores',
      '¿Estás seguro de que quieres desactivar la autenticación de dos factores?',
      {
        icon: 'warning',
        confirmText: 'Sí, desactivar',
        confirmColor: '#DC2626'
      }
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      await disable2FA();
      setTwoFAEnabled(false);
      showToast('success', 'Autenticación de dos factores desactivada');
    } catch (err) {
      setError('Error al desactivar 2FA');
      alertas.errorGeneral('Error al desactivar 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="configuracion-container">
      <h1>Configuración de Cuenta</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔐 Cambiar Contraseña
        </button>
        <button 
          className={`tab-btn ${activeTab === '2fa' ? 'active' : ''}`}
          onClick={() => setActiveTab('2fa')}
        >
          🔐 Autenticación de Dos Factores
        </button>
      </div>

      {/* Cambiar Contraseña Tab */}
      {activeTab === 'password' && (
        <div className="settings-content">
          <h2>Cambiar Contraseña</h2>
          <form onSubmit={handleSubmitPasswordChange} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Contraseña Actual</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <small>La contraseña debe tener al menos 8 caracteres</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <div className="settings-content">
          <h2>Autenticación de Dos Factores</h2>
          <p className="section-description">
            Agrega una capa adicional de seguridad a tu cuenta utilizando una aplicación de autenticación como Google Authenticator o Authy.
          </p>

          {!twoFAEnabled ? (
            <div className="settings-section">
              <p>Autenticación de dos factores: <strong>Desactivada</strong></p>
              <button 
                onClick={handleEnable2FA}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Habilitando...' : 'Habilitar 2FA'}
              </button>
            </div>
          ) : (
            <div className="settings-section">
              <p>Autenticación de dos factores: <strong>Activada</strong></p>

              {twoFASecret && (
                <div className="qr-section">
                  <p>Escanea este código QR con tu aplicación de autenticación:</p>
                  <div className="qr-placeholder">
                    {/* Aquí iría el código QR real */}
                    <p>Código QR: {twoFASecret}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleDisable2FA}
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? 'Deshabilitando...' : 'Desactivar 2FA'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="settings-footer">
        <button 
          onClick={() => navigate('/perfil')}
          className="btn btn-secondary"
        >
          ← Volver al Perfil
        </button>
      </div>
    </div>
  );
};

export default Configuracion;
