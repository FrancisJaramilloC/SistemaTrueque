// Formatear fecha
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Formatear fecha relativa (hace X tiempo)
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(dateString);
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Obtener URL de imagen
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23e0e0e0" width="300" height="300"/%3E%3Ctext x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
  if (imagePath.startsWith('http')) return imagePath;
  // Asegurar que la ruta tenga barra al inicio
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `http://localhost:8000${normalizedPath}`;
};

// Validar email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Mapear estado de propuesta a texto legible
export const getEstadoPropuestaText = (estado) => {
  const estados = {
    'pendiente': 'Pendiente',
    'aceptada': 'Aceptada',
    'rechazada': 'Rechazada',
    'cancelada': 'Cancelada',
    'completada': 'Completada'
  };
  return estados[estado] || estado;
};

// Mapear categoría a emoji
export const getCategoryIcon = (categoria) => {
  const icons = {
    'electronica': '💻',
    'Electrónica': '💻',
    'ropa': '👕',
    'Ropa': '👕',
    'libros': '📚',
    'Libros': '📚',
    'juguetes': '🧸',
    'Juguetes': '🧸',
    'deportes': '⚽',
    'Deportes': '⚽',
    'hogar': '🏠',
    'Hogar': '🏠',
    'musica': '🎵',
    'Música': '🎵',
    'arte': '🎨',
    'Arte': '🎨',
    'otros': '📦',
    'Otros': '📦'
  };
  return icons[categoria] || '📦';
};
