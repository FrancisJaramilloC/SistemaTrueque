import { useState, useEffect } from 'react';
import { getPropuestasEnviadas, updatePropuesta, revertirIntercambio } from '../services/propuestasService';
import { alertas } from '../utils/sweetAlert';
import { getEstadoPropuestaText } from '../utils/helpers';

const PropuestasEnviadas = () => {
  const [propuestas, setPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    loadPropuestas();
  }, []);

  const loadPropuestas = async () => {
    try {
      const data = await getPropuestasEnviadas();
      setPropuestas(data);
    } catch (err) {
      setError('Error al cargar propuestas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (propuestaId) => {
    const confirmed = await alertas.confirmarCancelarPropuesta();
    if (!confirmed) return;

    try {
      await updatePropuesta(propuestaId, { estado: 'cancelada' });
      await loadPropuestas(); // Recargar en lugar de modificar local
      alertas.articuloActualizado();
    } catch (err) {
      alertas.errorGeneral(err.response?.data?.detail || 'Error al cancelar propuesta');
      console.error(err);
    }
  };

  const handleRevertir = async (propuestaId) => {
    const confirmed = await alertas.confirmarRevertirIntercambio();
    if (!confirmed) return;

    try {
      await revertirIntercambio(propuestaId);
      await loadPropuestas();
      alertas.intercambioRevertido();
    } catch (err) {
      alertas.errorGeneral(err.response?.data?.detail || 'Error al revertir');
      console.error(err);
    }
  };

  const propuestasFiltradas = filterEstado 
    ? propuestas.filter(p => p.estado === filterEstado)
    : propuestas;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando propuestas...</p>
      </div>
    );
  }

  return (
    <div className="propuestas-container">
      <h1>Propuestas Enviadas</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <select 
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las propuestas</option>
          <option value="pendiente">Pendientes</option>
          <option value="aceptada">Aceptadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {propuestasFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>No has enviado propuestas {filterEstado ? 'con este estado' : ''}</p>
        </div>
      ) : (
        <div className="propuestas-grid">
          {propuestasFiltradas.map(propuesta => (
            <div key={propuesta.id} className="propuesta-card">
              <div className="propuesta-header">
                <h3>{propuesta.articulo_solicitado.titulo}</h3>
                <span className={`propuesta-status ${propuesta.estado}`}>
                  {getEstadoPropuestaText(propuesta.estado)}
                </span>
              </div>

              <div className="propuesta-details">
                <div className="detail-item">
                  <strong>Ofreces:</strong>
                  <p>{propuesta.articulo_ofrecido.titulo}</p>
                </div>

                <div className="detail-item">
                  <strong>A:</strong>
                  <p>{propuesta.usuario_receptor.nombre_completo}</p>
                </div>

                {propuesta.mensaje && (
                  <div className="detail-item">
                    <strong>Tu mensaje:</strong>
                    <p>{propuesta.mensaje}</p>
                  </div>
                )}
              </div>

              {propuesta.estado === 'pendiente' && (
                <div className="propuesta-actions">
                  <p className="info-text">⏳ Esperando respuesta...</p>
                  <button 
                    onClick={() => handleCancelar(propuesta.id)}
                    className="btn btn-danger"
                  >
                    Cancelar Propuesta
                  </button>
                </div>
              )}
              
              {propuesta.estado === 'aceptada' && (
                <div className="propuesta-actions">
                  <p className="success-text">✅ ¡Propuesta aceptada!</p>
                  <button 
                    onClick={() => handleRevertir(propuesta.id)}
                    className="btn btn-warning"
                  >
                    🔄 Marcar como no realizado
                  </button>
                </div>
              )}
              
              {propuesta.estado === 'rechazada' && (
                <div className="propuesta-actions">
                  <p className="error-text">❌ Tu propuesta fue rechazada</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropuestasEnviadas;
