// Categorías de artículos
export const CATEGORIAS_ARTICULO = [
  'electronica',
  'ropa',
  'libros',
  'deportes',
  'hogar',
  'juguetes',
  'otros'
];

// Condiciones de artículos
export const CONDICIONES_ARTICULO = [
  { value: 'excelente', label: 'Excelente' },
  { value: 'buena', label: 'Buena' },
  { value: 'aceptable', label: 'Aceptable' },
  { value: 'defectuosa', label: 'Defectuosa' }
];

// Estados de artículos
export const ESTADOS_ARTICULO = [
  'disponible',
  'en_negociacion',
  'intercambiado',
  'no_disponible'
];

// Estados de propuestas
export const ESTADOS_PROPUESTA = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada'
};

// Configuración de la API
export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const API_TIMEOUT = 30000; // 30 segundos

// Configuración de la aplicación
export const APP_NAME = 'Truekealo';
export const APP_DESCRIPTION = 'Plataforma de intercambio de artículos';

// Roles de usuario
export const USER_ROLES = {
  USUARIO: 'usuario',
  ADMIN: 'admin'
};
