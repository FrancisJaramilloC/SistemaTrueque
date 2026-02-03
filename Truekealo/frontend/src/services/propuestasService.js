import axiosInstance from './axiosConfig';

// Crear nueva propuesta de intercambio
export const createPropuesta = async (propuestaData) => {
  const response = await axiosInstance.post('/propuestas', propuestaData);
  return response.data;
};

// Obtener propuestas recibidas
export const getPropuestasRecibidas = async () => {
  const response = await axiosInstance.get('/propuestas/recibidas');
  return response.data;
};

// Obtener propuestas enviadas
export const getPropuestasEnviadas = async () => {
  const response = await axiosInstance.get('/propuestas/enviadas');
  return response.data;
};

// Obtener una propuesta por ID
export const getPropuestaById = async (id) => {
  const response = await axiosInstance.get(`/propuestas/${id}`);
  return response.data;
};

// Actualizar estado de propuesta (aceptar/rechazar/cancelar)
export const updatePropuesta = async (id, updateData) => {
  const response = await axiosInstance.patch(`/propuestas/${id}`, updateData);
  return response.data;
};

// Obtener resumen de propuestas
export const getResumenPropuestas = async () => {
  const response = await axiosInstance.get('/propuestas/resumen');
  return response.data;
};

// Revertir intercambio aceptado
export const revertirIntercambio = async (id) => {
  const response = await axiosInstance.put(`/propuestas/${id}/revertir`);
  return response.data;
};
