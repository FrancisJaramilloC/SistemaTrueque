import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Truekealo</h1>
          <h2>Intercambia artículos con tu comunidad</h2>
          <p>
            Plataforma de trueque donde puedes intercambiar artículos que ya no usas 
            por otros que necesitas. Sin dinero de por medio.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Comenzar Ahora
            </Link>
            <Link to="/explorar" className="btn btn-secondary btn-lg">
              Explorar Artículos
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>¿Por qué usar Truekealo?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Sostenible</h3>
            <p>Reutiliza y dale nueva vida a artículos que ya no usas</p>
          </div>

          <div className="feature-card">
            <h3>Sin Costos</h3>
            <p>Intercambia sin gastar dinero, solo intercambia valor por valor</p>
          </div>

          <div className="feature-card">
            <h3>Comunidad</h3>
            <p>Conéctate con personas de tu área y crea vínculos</p>
          </div>

          <div className="feature-card">
            <h3>Seguro</h3>
            <p>Sistema de mensajería y propuestas para negociar con confianza</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>¿Listo para comenzar a intercambiar?</h2>
        <p>Únete a nuestra comunidad y comienza a intercambiar hoy mismo</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Crear Cuenta Gratis
        </Link>
      </section>
    </div>
  );
};

export default Home;
