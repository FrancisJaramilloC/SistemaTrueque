import api from './api';

// Crear nueva propuesta
export const createPropuesta = async (propuestaData) => {
  const response = await api.post('/propuestas', propuestaData);
  return response.data;
};

// Obtener propuestas recibidas
export const getPropuestasRecibidas = async () => {
  const response = await api.get('/propuestas/recibidas');
  return response.data;
};

// Obtener propuestas enviadas
export const getPropuestasEnviadas = async () => {
  const response = await api.get('/propuestas/enviadas');
  return response.data;
};

// Obtener una propuesta por ID
export const getPropuestaById = async (id) => {
  const response = await api.get(`/propuestas/${id}`);
  return response.data;
};

// Aceptar propuesta
export const aceptarPropuesta = async (id) => {
  const response = await api.post(`/propuestas/${id}/aceptar`);
  return response.data;
};

// Rechazar propuesta
export const rechazarPropuesta = async (id) => {
  const response = await api.post(`/propuestas/${id}/rechazar`);
  return response.data;
};

// Cancelar propuesta
export const cancelarPropuesta = async (id) => {
  const response = await api.delete(`/propuestas/${id}`);
  return response.data;
};
