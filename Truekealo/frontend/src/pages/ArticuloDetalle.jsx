import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticuloById, getMisArticulos } from '../services/articulosService';
import { createPropuesta, getPropuestasEnviadas } from '../services/propuestasService';
import { sendMensaje } from '../services/mensajesService';
import { useAuth } from '../context/AuthContext';
import { alertas, showAlert } from '../utils/sweetAlert';
import { getImageUrl, getCategoryIcon } from '../utils/helpers';

const ArticuloDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPropuestaModal, setShowPropuestaModal] = useState(false);
  const [misArticulos, setMisArticulos] = useState([]);
  const [showMensajeModal, setShowMensajeModal] = useState(false);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [tienePropuestaPendiente, setTienePropuestaPendiente] = useState(false);
  const [propuestaForm, setPropuestaForm] = useState({
    articulo_ofrecido_id: '',
    descripcion: '',
  });

  useEffect(() => {
    loadArticulo();
  }, [id]);

  useEffect(() => {
    if (showPropuestaModal) {
      loadMisArticulos();
    }
  }, [showPropuestaModal]);

  const loadArticulo = async () => {
    try {
      const data = await getArticuloById(id);
      setArticulo(data);
      
      // Verificar si ya existe una propuesta pendiente para este artículo
      if (user && !data.propietario || data.propietario_id !== user?.id) {
        try {
          const propuestasEnviadas = await getPropuestasEnviadas();
          const propuestaPendiente = propuestasEnviadas.find(
            p => p.articulo_solicitado_id === Number(id) && p.estado === 'pendiente'
          );
          setTienePropuestaPendiente(!!propuestaPendiente);
        } catch (err) {
          console.error('Error al verificar propuestas:', err);
        }
      }
    } catch (err) {
      setError('Error al cargar el artículo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropuestaChange = (e) => {
    const { name, value } = e.target;
    setPropuestaForm({
      ...propuestaForm,
      [name]: value,
    });
  };

  const loadMisArticulos = async () => {
    try {
      const data = await getMisArticulos();
      // Solo artículos disponibles y distintos al solicitado
      const disponibles = data.filter(
        (art) => art.estado_articulo === 'disponible' && art.id !== Number(id)
      );
      setMisArticulos(disponibles);
    } catch (err) {
      console.error('Error al cargar tus artículos:', err);
    }
  };

  const handleSubmitPropuesta = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!propuestaForm.articulo_ofrecido_id) {
        setError('Debes seleccionar un artículo para ofrecer');
        return;
      }

      await createPropuesta({
        ...propuestaForm,
        articulo_solicitado_id: parseInt(id),
      });

      setShowPropuestaModal(false);
      setPropuestaForm({ articulo_ofrecido_id: '', descripcion: '' });
      alertas.propuestaEnviada();
      await loadArticulo(); // Recargar para actualizar estado de propuesta pendiente
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al enviar propuesta';
      if (errorMsg.includes('ya existe una propuesta')) {
        alertas.propuestaDuplicada();
      } else if (errorMsg.includes('no está disponible') || errorMsg.includes('no disponible')) {
        alertas.articuloNoDisponible();
      } else {
        showAlert('error', 'Error al enviar propuesta', errorMsg, { showConfirmButton: true });
      }
      setError(errorMsg);
    }
  };

  const handleContactar = () => {
    setShowMensajeModal(true);
    setError('');
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeTexto.trim()) return;

    try {
      await sendMensaje({
        destinatario_id: articulo.propietario_id,
        contenido: mensajeTexto
      });

      setShowMensajeModal(false);
      setMensajeTexto('');
      alertas.mensajeEnviado();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar mensaje');
      showAlert('error', 'Error', err.response?.data?.detail || 'Error al enviar mensaje', { showConfirmButton: true });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando artículo...</p>
      </div>
    );
  }

  if (error || !articulo) {
    return (
      <div className="articulo-detalle-container">
        <div className="error-message">{error || 'Artículo no encontrado'}</div>
        <Link to="/explorar" className="btn btn-primary">Volver a explorar</Link>
      </div>
    );
  }

  const esOwner = user && articulo.propietario_id === user.id;

  return (
    <div className="articulo-detalle-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">Volver</button>

      <div className="detalle-grid">
        <div className="detalle-imagen">
          <img 
            src={getImageUrl(articulo.imagen_url)} 
            alt={articulo.titulo}
            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
          />
        </div>

        <div className="detalle-info">
          <div className="detalle-badges">
            <span className="categoria-badge">
              {getCategoryIcon(articulo.categoria)} {articulo.categoria}
            </span>
            <span className={`status-badge ${articulo.estado_articulo === 'disponible' ? 'disponible' : 'no-disponible'}`}>
              {articulo.estado_articulo}
            </span>
          </div>

          <h1>{articulo.titulo}</h1>
          
          <div className="detalle-condicion">
            <strong>Condición:</strong> {articulo.condicion}
          </div>

          <div className="detalle-descripcion">
            <h3>Descripción</h3>
            <p>{articulo.descripcion}</p>
          </div>

          <div className="detalle-propietario">
            <h3>Información del Propietario</h3>
            <div className="propietario-card">
              <p><strong>👤 {articulo.propietario?.nombre_completo}</strong></p>
              {articulo.propietario?.ubicacion && (
                <p>📍 {articulo.propietario.ubicacion}</p>
              )}
              {articulo.propietario?.telefono && (
                <p>📞 {articulo.propietario.telefono}</p>
              )}
            </div>
          </div>

          <div className="detalle-acciones">
            {esOwner ? (
              <>
                <Link to={`/editar-articulo/${articulo.id}`} className="btn btn-secondary">
                  ✏️ Editar
                </Link>
              </>
            ) : articulo.estado_articulo === 'intercambiado' ? (
              <div className="mensaje-no-disponible">
                <p>❌ Este artículo ya no está disponible</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>Ya fue intercambiado</p>
              </div>
            ) : tienePropuestaPendiente ? (
              <div className="mensaje-propuesta-pendiente">
                <p>⏳ Propuesta enviada – esperando respuesta</p>
                <Link to="/propuestas-enviadas" className="btn btn-secondary" style={{ marginTop: '10px' }}>
                  Ver mis propuestas
                </Link>
              </div>
            ) : articulo.estado_articulo === 'disponible' ? (
              <>
                <button 
                  onClick={() => setShowPropuestaModal(true)}
                  className="btn btn-primary"
                >
                  🤝 Hacer Propuesta de Intercambio
                </button>
                <button 
                  onClick={handleContactar}
                  className="btn btn-secondary"
                  style={{ marginLeft: '10px' }}
                >
                  💬 Contactar Vendedor
                </button>
              </>
            ) : (
              <button disabled className="btn btn-primary"> 
                ❌ No disponible
              </button>
            )
            }
          </div>
        </div>
      </div>

      {showMensajeModal && !esOwner && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Contactar a {articulo.propietario?.nombre_completo}</h2>
              <button
                onClick={() => setShowMensajeModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleEnviarMensaje}>
              <div className="form-group">
                <label>Tu mensaje</label>
                <textarea
                  value={mensajeTexto}
                  onChange={(e) => setMensajeTexto(e.target.value)}
                  placeholder={`Hola, me interesa tu ${articulo.titulo}...`}
                  rows="6"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowMensajeModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPropuestaModal && !esOwner && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Hacer Propuesta de Intercambio</h2>
              <button 
                onClick={() => setShowPropuestaModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmitPropuesta}>
              <div className="form-group">
                <label>¿Qué artículo ofreces?</label>
                <p className="form-hint">Selecciona uno de tus artículos disponibles</p>
                <select
                  name="articulo_ofrecido_id"
                  value={propuestaForm.articulo_ofrecido_id}
                  onChange={handlePropuestaChange}
                  required
                >
                  <option value="">Selecciona un artículo</option>
                  {misArticulos.length === 0 ? (
                    <option value="" disabled>No tienes artículos disponibles</option>
                  ) : (
                    misArticulos.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.titulo} · {art.condicion}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Mensaje (opcional)</label>
                <textarea
                  name="descripcion"
                  value={propuestaForm.descripcion}
                  onChange={handlePropuestaChange}
                  placeholder="Cuéntale al propietario por qué este intercambio te interesa..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={() => setShowPropuestaModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar Propuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticuloDetalle;
