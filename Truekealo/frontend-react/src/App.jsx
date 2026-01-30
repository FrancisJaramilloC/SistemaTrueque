import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AccessibilityPanel from './components/AccessibilityPanel';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explorar from './pages/Explorar';
import MisArticulos from './pages/MisArticulos';
import PublicarArticulo from './pages/PublicarArticulo';
import ArticuloDetalle from './pages/ArticuloDetalle';
import EditArticulo from './pages/EditArticulo';
import Mensajes from './pages/Mensajes';
import PropuestasRecibidas from './pages/PropuestasRecibidas';
import PropuestasEnviadas from './pages/PropuestasEnviadas';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <AccessibilityPanel />
          <main className="main-content">
          <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explorar" element={<Explorar />} />
              <Route path="/articulo/:id" element={<ArticuloDetalle />} />

              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mis-articulos" 
                element={
                  <ProtectedRoute>
                    <MisArticulos />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/publicar" 
                element={
                  <ProtectedRoute>
                    <PublicarArticulo />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/editar-articulo/:id" 
                element={
                  <ProtectedRoute>
                    <EditArticulo />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mensajes" 
                element={
                  <ProtectedRoute>
                    <Mensajes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propuestas/recibidas" 
                element={
                  <ProtectedRoute>
                    <PropuestasRecibidas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propuestas/enviadas" 
                element={
                  <ProtectedRoute>
                    <PropuestasEnviadas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracion" 
                element={
                  <ProtectedRoute>
                    <Configuracion />
                  </ProtectedRoute>
                } 
              />

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
