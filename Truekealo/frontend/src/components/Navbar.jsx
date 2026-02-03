import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropuestasMenu from './PropuestasMenu';
import UserMenu from './UserMenu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
            <path d="M30 35 L50 20 L50 35" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 20 L70 35" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30 65 L50 80 L50 65" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 80 L70 65" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.2"/>
            <path d="M 35 45 Q 50 50 65 45" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6"/>
            <path d="M 35 55 Q 50 50 65 55" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6"/>
          </svg>
          <span className="logo-text">Truekealo</span>
        </Link>

        <button 
          className="nav-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Inicio
              </Link>
              <Link to="/explorar" className="nav-link">
                Explorar
              </Link>
              <Link to="/mis-articulos" className="nav-link">
                Mis Artículos
              </Link>
              <Link to="/publicar" className="nav-link">
                Publicar
              </Link>
              <Link to="/mensajes" className="nav-link">
                Mensajes
              </Link>
              
              <PropuestasMenu />
              
              <UserMenu userName={user?.nombre_completo} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
