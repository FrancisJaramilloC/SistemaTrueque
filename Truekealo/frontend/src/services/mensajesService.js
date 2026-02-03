import axiosInstance from './axiosConfig';

// Enviar mensaje
export const sendMensaje = async (mensajeData) => {
  const response = await axiosInstance.post('/mensajes', mensajeData);
  return response.data;
};

// Obtener conversación con un usuario
export const getConversacion = async (usuarioId) => {
  const response = await axiosInstance.get(`/mensajes/conversacion/${usuarioId}`);
  return response.data;
};

// Obtener lista de conversaciones
export const getConversaciones = async () => {
  const response = await axiosInstance.get('/mensajes/conversaciones');
  return response.data;
};

// Marcar mensaje como leído
export const marcarComoLeido = async (mensajeId) => {
  const response = await axiosInstance.put(`/mensajes/${mensajeId}/leer`);
  return response.data;
};

// Obtener cantidad de mensajes no leídos
export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/mensajes/unread-count');
  return response.data;
};
