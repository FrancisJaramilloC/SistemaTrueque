import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertas, showConfirm } from '../utils/sweetAlert';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../services/authService';

const Perfil = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre_completo: user?.nombre_completo || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    ubicacion: user?.ubicacion || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Llamar al backend para actualizar el perfil
      const updatedUser = await updateProfile({
        nombre_completo: formData.nombre_completo,
        telefono: formData.telefono || null,
        ubicacion: formData.ubicacion || null,
      });
      
      // Actualizar el contexto y localStorage con los datos del servidor
      updateUser(updatedUser);
      
      alertas.perfilActualizado();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el perfil');
      alertas.errorGeneral(err.response?.data?.detail || 'Error al actualizar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      {
        icon: 'question',
        confirmText: 'Sí, cerrar sesión',
        confirmColor: '#DC2626'
      }
    );
    if (confirmed) {
      logout();
      alertas.sesionCerrada();
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="perfil-container">
        <p>Por favor inicia sesión</p>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <h1>Mi Perfil</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            <div className="avatar-placeholder">
              {user.nombre_completo?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="perfil-basic-info">
            <h2>{user.nombre_completo}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="perfil-info">
            <div className="info-group">
              <label>Nombre Completo</label>
              <p>{user.nombre_completo}</p>
            </div>

            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            <div className="info-group">
              <label>Teléfono</label>
              <p>{user.telefono || 'No registrado'}</p>
            </div>

            <div className="info-group">
              <label>Ubicación</label>
              <p>{user.ubicacion || 'No registrada'}</p>
            </div>

            <div className="perfil-actions">
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
              >
                ✏️ Editar Perfil
              </button>
              <button 
                onClick={() => navigate('/configuracion')}
                className="btn btn-secondary"
              >
                ⚙️ Configuración
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="perfil-form">
            <div className="form-group">
              <label htmlFor="nombre_completo">Nombre Completo</label>
              <input
                id="nombre_completo"
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <small>No puedes cambiar tu email</small>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +57 300 1234567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ubicacion">Ubicación</label>
              <input
                id="ubicacion"
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Medellín, Antioquia"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Perfil;
