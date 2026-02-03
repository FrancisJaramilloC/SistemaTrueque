import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActividades } from '../services/actividadesService';
import { getPropuestasRecibidas, getPropuestasEnviadas } from '../services/propuestasService';
import { getUnreadCount } from '../services/mensajesService';
import { getMisArticulos } from '../services/articulosService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [propuestasRecibidas, setPropuestasRecibidas] = useState([]);
  const [propuestasEnviadas, setPropuestasEnviadas] = useState([]);
  const [totalArticulos, setTotalArticulos] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [actividadesData, recibidas, enviadas, misArticulos, unread] = await Promise.all([
        getActividades(),
        getPropuestasRecibidas(),
        getPropuestasEnviadas(),
        getMisArticulos(),
        getUnreadCount(),
      ]);

      setActividades(actividadesData.slice(0, 5)); // Últimas 5 actividades
      setPropuestasRecibidas(recibidas.filter(p => p.estado === 'pendiente'));
      setPropuestasEnviadas(enviadas.filter(p => p.estado === 'pendiente'));
      setTotalArticulos(Array.isArray(misArticulos) ? misArticulos.length : 0);
      setUnreadMessages(unread?.unread || 0);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>¡Hola, {user?.nombre_completo}! 👋</h1>
        <p>Bienvenido a tu panel de control</p>
      </div>

      <div className="dashboard-grid">
        {/* Tarjetas de estadísticas */}
        <div className="stats-card">
          <div className="stat-icon">📨</div>
          <div className="stat-content">
            <h3>{propuestasRecibidas.length}</h3>
            <p>Propuestas Recibidas</p>
          </div>
          <Link to="/propuestas/recibidas" className="stat-link">Ver →</Link>
        </div>

        <div className="stats-card">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <h3>{propuestasEnviadas.length}</h3>
            <p>Propuestas Enviadas</p>
          </div>
          <Link to="/propuestas/enviadas" className="stat-link">Ver →</Link>
        </div>

        <div className="stats-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{unreadMessages}</h3>
            <p>Mensajes No Leídos</p>
          </div>
          <Link to="/mensajes" className="stat-link">Ver →</Link>
        </div>

        <div className="stats-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{totalArticulos}</h3>
            <p>Mis Artículos</p>
          </div>
          <Link to="/mis-articulos" className="stat-link">Ver →</Link>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Actividad Reciente</h2>
        </div>

        {actividades.length === 0 ? (
          <div className="empty-state">
            <p>No hay actividades recientes</p>
            <Link to="/explorar" className="btn btn-primary">
              Explorar artículos
            </Link>
          </div>
        ) : (
          <div className="activity-list">
            {actividades.map((actividad) => {
              const fecha = actividad.fecha_creacion || actividad.createdAt || actividad.date;
              let fechaFormato = 'Sin fecha';
              
              if (fecha) {
                try {
                  const d = new Date(fecha);
                  if (!isNaN(d.getTime())) {
                    const opciones = { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    };
                    fechaFormato = d.toLocaleDateString('es-EC', opciones).replace(',', ' ·');
                  }
                } catch (e) {
                  fechaFormato = 'Sin fecha';
                }
              }

              return (
                <div key={actividad.id} className="activity-item">
                  <div className="activity-icon">
                    {actividad.tipo === 'propuesta' && '🤝'}
                    {actividad.tipo === 'mensaje' && '💬'}
                    {actividad.tipo === 'articulo' && '📦'}
                  </div>
                  <div className="activity-content">
                    <p>{actividad.descripcion}</p>
                    <span className="activity-time">{fechaFormato}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="dashboard-section">
        <h2>Acciones Rápidas</h2>
        <div className="quick-actions">
          <Link to="/publicar" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Publicar Artículo</h3>
            <p>Agrega un nuevo artículo para intercambiar</p>
          </Link>

          <Link to="/explorar" className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Explorar</h3>
            <p>Busca artículos para intercambiar</p>
          </Link>

          <Link to="/mensajes" className="action-card">
            <div className="action-icon">💬</div>
            <h3>Mensajes</h3>
            <p>Comunícate con otros usuarios</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
