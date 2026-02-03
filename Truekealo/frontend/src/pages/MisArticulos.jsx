import { useState, useEffect } from 'react';
import { getMisArticulos, deleteArticulo, updateArticulo } from '../services/articulosService';
import { alertas, showToast } from '../utils/sweetAlert';
import { getImageUrl, getCategoryIcon } from '../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';

const MisArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadArticulos();
  }, []);

  const loadArticulos = async () => {
    try {
      const data = await getMisArticulos();
      setArticulos(data);
    } catch (error) {
      console.error('Error al cargar mis artículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alertas.confirmarEliminarArticulo();
    if (!confirmed) return;

    try {
      await deleteArticulo(id);
      setArticulos(articulos.filter(art => art.id !== id));
      alertas.articuloEliminado();
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      alertas.errorGeneral('Error al eliminar el artículo');
    }
  };

  const handleToggleDisponibilidad = async (articulo) => {
    const nuevoEstado = articulo.estado_articulo === 'disponible' ? 'no_disponible' : 'disponible';
    try {
      await updateArticulo(articulo.id, { estado_articulo: nuevoEstado });
      setArticulos((prev) => prev.map((a) => a.id === articulo.id ? { ...a, estado_articulo: nuevoEstado } : a));
      const mensaje = nuevoEstado === 'disponible' ? 'Artículo marcado como disponible' : 'Artículo marcado como no disponible';
      showToast('success', mensaje);
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      alertas.errorGeneral('No se pudo actualizar la disponibilidad');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus artículos...</p>
      </div>
    );
  }

  return (
    <div className="mis-articulos-container">
      <div className="page-header">
        <div>
          <h1>Mis Artículos</h1>
          <p>Administra tus publicaciones</p>
        </div>
        <Link to="/publicar" className="btn btn-primary">
          Publicar Artículo
        </Link>
      </div>

      {articulos.length === 0 ? (
        <div className="empty-state">
          <h3>No tienes artículos publicados</h3>
          <p>¡Comienza publicando tu primer artículo para intercambiar!</p>
          <Link to="/publicar" className="btn btn-primary">
            Publicar Artículo
          </Link>
        </div>
      ) : (
        <div className="articulos-list">
          {articulos.map((articulo) => (
            <div key={articulo.id} className="articulo-item">
              <div className="articulo-image">
                <img 
                  src={getImageUrl(articulo.imagen_url)} 
                  alt={articulo.titulo}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>

              <div className="articulo-info">
                <div className="articulo-badges">
                  <span className="categoria-badge">
                    {getCategoryIcon(articulo.categoria)} {articulo.categoria}
                  </span>
                  <span className={`status-badge ${
                    articulo.estado_articulo === 'disponible' ? 'disponible' : 
                    articulo.estado_articulo === 'intercambiado' ? 'intercambiado' : 
                    'no-disponible'
                  }`}>
                    {articulo.estado_articulo === 'disponible' ? '✅ Disponible' : 
                     articulo.estado_articulo === 'intercambiado' ? '🔄 Intercambiado' : 
                     '❌ No Disponible'}
                  </span>
                </div>

                <h3>{articulo.titulo}</h3>
                <p className="articulo-description">{articulo.descripcion}</p>

                <div className="articulo-meta">
                  <span>Condición: {articulo.condicion}</span>
                  <span>•</span>
                  <span>Publicado: {new Date(articulo.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="articulo-actions">
                <Link 
                  to={`/articulo/${articulo.id}`} 
                  className="btn btn-secondary"
                >
                  Ver
                </Link>
                <Link 
                  to={`/editar-articulo/${articulo.id}`} 
                  className="btn btn-primary"
                >
                  Editar
                </Link>
                {articulo.estado_articulo !== 'intercambiado' && (
                  <button 
                    onClick={() => handleToggleDisponibilidad(articulo)}
                    className="btn btn-outline"
                  >
                    {articulo.estado_articulo === 'disponible' ? 'Marcar no disponible' : 'Marcar disponible'}
                  </button>
                )}
                {articulo.estado_articulo === 'intercambiado' && (
                  <span className="intercambio-info" style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#666', textAlign: 'center', background: '#f3f4f6', borderRadius: 'var(--radius-md)' }}>
                    Intercambio realizado
                  </span>
                )}
                <button 
                  onClick={() => handleDelete(articulo.id)}
                  className="btn btn-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisArticulos;
