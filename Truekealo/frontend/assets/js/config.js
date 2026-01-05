// Frontend runtime configuration for Truekealo
// Adjust apiBase for FastAPI backend and deployment environment
(function(){
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  
  // Configuración principal
  window.APP_CONFIG = {
    apiBase: isLocal ? 'http://localhost:8000/api' : '/api',
    // If backend uses HttpOnly cookies for auth, set true to send credentials
    useCookies: false,
    // Optional token provider callback. If not provided, falls back to localStorage('auth_token')
    tokenProvider: null
  };
  
  // Variables globales para compatibilidad
  window.apiBase = window.APP_CONFIG.apiBase + '/v1';
  window.API_BASE = window.apiBase; // Alias alternativo
  
  console.log('✅ Config cargada - apiBase:', window.apiBase);
})();
