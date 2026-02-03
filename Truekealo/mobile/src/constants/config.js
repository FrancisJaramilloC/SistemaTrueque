// Configuración global de la aplicación Truekealo Mobile
// Colores y estilos replicados del frontend web React

// ================== API Configuration ==================
// Detectar el ambiente automáticamente
// - Android Emulator: usa 10.0.2.2 (dirección especial para localhost en emulador)
// - Dispositivo físico: usa 192.168.0.3 (cambiar según tu red)
// - iOS: usa localhost directamente

import { Platform } from 'react-native';

// Configuración por plataforma
const getApiUrl = () => {
  // IMPORTANTE: Si estás usando Expo Go en dispositivo físico,
  // SIEMPRE usa la IP de tu red local (no 10.0.2.2)
  
  // Para dispositivo físico (Expo Go)
  return 'http://192.168.0.3:8001/api/v1';
  
  // Descomentar esto solo si usas Android Emulator:
  // if (Platform.OS === 'android') {
  //   return 'http://10.0.2.2:8001/api/v1';
  // }
  // return 'http://192.168.0.3:8001/api/v1';
};

export const API_URL = getApiUrl();

// ================== Colores (idénticos al frontend web) ==================
export const COLORS = {
  // Colores primarios - Del frontend web
  primary: '#d4742f',        // Naranja principal
  
  // Fondos
  background: '#FAF8F5',     // Fondo claro (default)
  backgroundDark: '#211311', // Fondo oscuro (para dark mode)
  card: '#fcf9f8',          // Cards claras
  cardDark: '#2a1a18',      // Cards oscuras
  
  // Textos
  text: '#1b100e',          // Texto principal
  textDark: '#f8f6f6',      // Texto en dark mode
  textSecondary: '#97594e', // Texto secundario / muted
  textSecondaryDark: '#a88e89', // Texto secundario oscuro
  
  // Estados y acciones
  success: '#10b981',       // Verde éxito
  danger: '#dc2626',        // Rojo peligro
  warning: '#f59e0b',       // Naranja warning
  
  // UI Elements
  border: '#e0d5ce',        // Bordes claros
  borderDark: '#3a2a28',    // Bordes oscuros
  active: '#f3e9e7',        // Fondo activo claro
  activeDark: 'rgba(212, 116, 47, 0.2)', // Fondo activo oscuro
  
  // Adicionales
  lightPrimary: '#f5e9e6',  // Primario muy claro
  lightBorder: '#ece6e0',   // Borde extra claro
  divider: '#e8dcd5',       // Divisor
};

// ================== Tipografía ==================
export const TYPOGRAPHY = {
  fontFamily: 'System', // React Native usa system fonts por defecto
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ================== Espaciado ==================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// ================== Border Radius ==================
export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ================== Sombras ==================
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ================== API Endpoints (del backend) ==================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  ARTICULOS: {
    LIST: '/articulos',
    DETAIL: (id) => `/articulos/${id}`,
    CREATE: '/articulos',
    UPDATE: (id) => `/articulos/${id}`,
    DELETE: (id) => `/articulos/${id}`,
    MY_ARTICLES: '/articulos/mis-articulos',
    UPLOAD_IMAGE: (id) => `/articulos/${id}/imagen`,
  },
  MENSAJES: {
    LIST: '/mensajes',
    DETAIL: (id) => `/mensajes/${id}`,
    CREATE: '/mensajes',
    MARK_AS_READ: (id) => `/mensajes/${id}/read`,
    CONVERSATION: (userId) => `/mensajes/conversacion/${userId}`,
  },
  PROPUESTAS: {
    LIST: '/propuestas',
    SENT: '/propuestas/enviadas',
    RECEIVED: '/propuestas/recibidas',
    CREATE: '/propuestas',
    UPDATE: (id) => `/propuestas/${id}`,
    CANCEL: (id) => `/propuestas/${id}/cancel`,
    RESPOND: (id) => `/propuestas/${id}/responder`,
  },
  ACTIVIDADES: {
    LIST: '/actividades',
    DETAIL: (id) => `/actividades/${id}`,
  },
};

// ================== Mensajes de error estándar ==================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  EMAIL_EXISTS: 'El email ya está registrado.',
  REQUIRED_FIELD: 'Este campo es requerido.',
  INVALID_EMAIL: 'Email no válido.',
  WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres.',
  UNAUTHORIZED: 'Sesión expirada. Por favor inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para acceder a este recurso.',
  NOT_FOUND: 'Recurso no encontrado.',
  SERVER_ERROR: 'Error en el servidor. Intenta más tarde.',
  GENERIC_ERROR: 'Algo salió mal. Intenta nuevamente.',
};

// ================== Validaciones ==================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
