import { useState, useEffect } from 'react';
import { getPropuestasRecibidas, updatePropuesta, revertirIntercambio } from '../services/propuestasService';
import { alertas } from '../utils/sweetAlert';
import { getEstadoPropuestaText } from '../utils/helpers';

const PropuestasRecibidas = () => {
  const [propuestas, setPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    loadPropuestas();
  }, []);

  const loadPropuestas = async () => {
    try {
      const data = await getPropuestasRecibidas();
      setPropuestas(data);
    } catch (err) {
      setError('Error al cargar propuestas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = async (propuestaId) => {
    const confirmed = await alertas.confirmarAceptarPropuesta();
    if (!confirmed) return;

    try {
      await updatePropuesta(propuestaId, { estado: 'aceptada' });
      await loadPropuestas(); // Recargar datos desde servidor
      alertas.propuestaAceptada();
    } catch (err) {
      alertas.errorGeneral(err.response?.data?.detail || 'Error al aceptar propuesta');
      console.error(err);
    }
  };

  const handleRechazar = async (propuestaId) => {
    const confirmed = await alertas.confirmarRechazarPropuesta();
    if (!confirmed) return;

    try {
      await updatePropuesta(propuestaId, { estado: 'rechazada' });
      await loadPropuestas(); // Recargar datos desde servidor
      alertas.propuestaRechazada();
    } catch (err) {
      alertas.errorGeneral(err.response?.data?.detail || 'Error al rechazar propuesta');
      console.error(err);
    }
  };

  const handleRevertir = async (propuestaId) => {
    const confirmed = await alertas.confirmarRevertirIntercambio();
    if (!confirmed) return;

    try {
      await revertirIntercambio(propuestaId);
      await loadPropuestas(); // Recargar para ver los cambios
      alertas.intercambioRevertido();
    } catch (err) {
      alertas.errorGeneral(err.response?.data?.detail || 'Error al revertir intercambio');
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
      <h1>Propuestas Recibidas</h1>

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
        </select>
      </div>

      {propuestasFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>No tienes propuestas {filterEstado ? 'con este estado' : ''}</p>
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
                  <strong>Propone:</strong>
                  <p>{propuesta.articulo_ofrecido.titulo}</p>
                </div>

                <div className="detail-item">
                  <strong>Desde:</strong>
                  <p>{propuesta.usuario_ofertante.nombre_completo}</p>
                </div>

                {propuesta.mensaje && (
                  <div className="detail-item">
                    <strong>Mensaje:</strong>
                    <p>{propuesta.mensaje}</p>
                  </div>
                )}
              </div>

              {propuesta.estado === 'pendiente' && (
                <div className="propuesta-actions">
                  <button 
                    onClick={() => handleAceptar(propuesta.id)}
                    className="btn btn-success"
                  >
                    ✓ Aceptar
                  </button>
                  <button 
                    onClick={() => handleRechazar(propuesta.id)}
                    className="btn btn-danger"
                  >
                    ✗ Rechazar
                  </button>
                </div>
              )}
              
              {propuesta.estado === 'aceptada' && (
                <div className="propuesta-actions">
                  <button 
                    onClick={() => handleRevertir(propuesta.id)}
                    className="btn btn-warning"
                  >
                    🔄 Marcar intercambio como no realizado
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropuestasRecibidas;
