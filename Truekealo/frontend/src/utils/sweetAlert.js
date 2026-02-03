import Swal from 'sweetalert2';

/**
 * Configuración global de SweetAlert2 para el sistema de trueque
 */
const defaultConfig = {
  confirmButtonColor: '#4F46E5',
  cancelButtonColor: '#6B7280',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
};

/**
 * Muestra una alerta usando SweetAlert2
 * @param {string} type - Tipo de alerta: 'success', 'error', 'warning', 'info', 'question'
 * @param {string} title - Título de la alerta
 * @param {string} message - Mensaje descriptivo
 * @param {object} options - Opciones adicionales de SweetAlert2
 * @returns {Promise} Resultado de la alerta
 */
export const showAlert = (type, title, message = '', options = {}) => {
  const config = {
    icon: type,
    title: title,
    text: message,
    ...defaultConfig,
    ...options,
  };

  // Configuración específica según el tipo
  if (type === 'success') {
    config.timer = options.timer || 3000;
    config.showConfirmButton = options.showConfirmButton ?? false;
    config.timerProgressBar = true;
  }

  if (type === 'error') {
    config.timer = options.timer || 4000;
    config.timerProgressBar = true;
  }

  return Swal.fire(config);
};

/**
 * Muestra un diálogo de confirmación
 * @param {string} title - Título del diálogo
 * @param {string} message - Mensaje de confirmación
 * @param {object} options - Opciones adicionales
 * @returns {Promise<boolean>} true si confirma, false si cancela
 */
export const showConfirm = async (title, message, options = {}) => {
  const result = await Swal.fire({
    icon: options.icon || 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Confirmar',
    cancelButtonText: options.cancelText || 'Cancelar',
    confirmButtonColor: options.confirmColor || '#4F46E5',
    cancelButtonColor: '#6B7280',
    reverseButtons: true,
    ...options,
  });

  return result.isConfirmed;
};

/**
 * Muestra un diálogo de confirmación de acción crítica (peligrosa)
 * @param {string} title - Título del diálogo
 * @param {string} message - Mensaje de advertencia
 * @param {object} options - Opciones adicionales
 * @returns {Promise<boolean>} true si confirma, false si cancela
 */
export const showDangerConfirm = async (title, message, options = {}) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Sí, eliminar',
    cancelButtonText: options.cancelText || 'Cancelar',
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    reverseButtons: true,
    ...options,
  });

  return result.isConfirmed;
};

/**
 * Muestra un toast (notificación pequeña) en la esquina
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {string} message - Mensaje breve
 * @param {number} timer - Duración en milisegundos (default: 3000)
 */
export const showToast = (type, message, timer = 3000) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: type,
    title: message,
  });
};

/**
 * Casos específicos del sistema de trueque
 */
export const alertas = {
  // Propuestas
  propuestaEnviada: () =>
    showAlert('success', 'Propuesta enviada', 'Esperando respuesta del usuario'),

  propuestaDuplicada: () =>
    showAlert('warning', 'Propuesta duplicada', 'Ya existe una propuesta pendiente para este artículo', {
      showConfirmButton: true,
    }),

  propuestaAceptada: () =>
    showAlert('success', 'Intercambio confirmado', 'El artículo ya no está disponible'),

  propuestaRechazada: () =>
    showAlert('error', 'Propuesta rechazada', 'El usuario rechazó tu propuesta'),

  articuloNoDisponible: () =>
    showAlert('info', 'Artículo no disponible', 'Este artículo ya fue intercambiado', {
      showConfirmButton: true,
    }),

  // Confirmaciones críticas
  confirmarAceptarPropuesta: async () =>
    showConfirm(
      '¿Aceptar propuesta?',
      'Se realizará el intercambio y ambos artículos quedarán marcados como intercambiados',
      {
        icon: 'question',
        confirmText: 'Sí, aceptar',
        confirmColor: '#10B981',
      }
    ),

  confirmarRevertirIntercambio: async () =>
    showConfirm(
      '¿Revertir intercambio?',
      'Los artículos volverán a estar disponibles y la propuesta se cancelará',
      {
        icon: 'warning',
        confirmText: 'Sí, revertir',
        confirmColor: '#F59E0B',
      }
    ),

  confirmarRechazarPropuesta: async () =>
    showConfirm('¿Rechazar propuesta?', 'Se notificará al usuario que su propuesta fue rechazada', {
      icon: 'warning',
      confirmText: 'Sí, rechazar',
      confirmColor: '#EF4444',
    }),

  confirmarEliminarArticulo: async () =>
    showDangerConfirm(
      '¿Eliminar artículo?',
      'Esta acción no se puede deshacer. El artículo será eliminado permanentemente.'
    ),

  confirmarCancelarPropuesta: async () =>
    showConfirm('¿Cancelar propuesta?', 'La propuesta se cancelará y no podrás recuperarla', {
      icon: 'warning',
      confirmText: 'Sí, cancelar',
      confirmColor: '#EF4444',
    }),

  // Éxitos generales
  perfilActualizado: () => showToast('success', 'Perfil actualizado correctamente'),

  articuloPublicado: () => showAlert('success', 'Artículo publicado', 'Tu artículo está disponible para intercambio'),

  articuloActualizado: () => showToast('success', 'Artículo actualizado'),

  articuloEliminado: () => showToast('success', 'Artículo eliminado'),

  mensajeEnviado: () => showToast('success', 'Mensaje enviado'),

  intercambioRevertido: () => showAlert('success', 'Intercambio revertido', 'Los artículos vuelven a estar disponibles'),

  // Errores generales
  errorGeneral: (mensaje = 'Ocurrió un error') => showAlert('error', 'Error', mensaje, { showConfirmButton: true }),

  errorCarga: () => showAlert('error', 'Error al cargar', 'No se pudieron cargar los datos', { showConfirmButton: true }),

  errorConexion: () =>
    showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor', { showConfirmButton: true }),

  // Información
  sesionCerrada: () => showToast('info', 'Sesión cerrada'),

  camposRequeridos: () => showAlert('warning', 'Campos requeridos', 'Por favor completa todos los campos obligatorios', {
    showConfirmButton: true,
  }),
};

/**
 * Maneja respuestas del backend automáticamente
 * @param {object} response - Respuesta del backend con { status, message, type }
 */
export const handleBackendResponse = (response) => {
  if (!response || !response.message) return;

  const type = response.type || (response.status === 'success' ? 'success' : 'error');
  const title = response.status === 'success' ? 'Éxito' : response.status === 'error' ? 'Error' : 'Información';

  if (response.toast) {
    showToast(type, response.message);
  } else {
    showAlert(type, title, response.message);
  }
};

export default {
  showAlert,
  showConfirm,
  showDangerConfirm,
  showToast,
  alertas,
  handleBackendResponse,
};
