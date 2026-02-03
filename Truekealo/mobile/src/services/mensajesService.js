import api from './api';

// Obtener todas las conversaciones del usuario
export const getConversaciones = async () => {
  const response = await api.get('/mensajes/conversaciones');
  return response.data;
};

// Obtener mensajes de una conversación
export const getMensajesConversacion = async (userId) => {
  const response = await api.get(`/mensajes/conversacion/${userId}`);
  return response.data;
};

// Enviar mensaje
export const enviarMensaje = async (mensajeData) => {
  const response = await api.post('/mensajes', mensajeData);
  return response.data;
};

// Marcar mensaje como leído
export const marcarComoLeido = async (mensajeId) => {
  const response = await api.put(`/mensajes/${mensajeId}/leer`);
  return response.data;
};

// Eliminar mensaje
export const eliminarMensaje = async (mensajeId) => {
  const response = await api.delete(`/mensajes/${mensajeId}`);
  return response.data;
};
