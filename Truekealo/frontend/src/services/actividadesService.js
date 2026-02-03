import axiosInstance from './axiosConfig';

// Obtener actividades del usuario
export const getActividades = async () => {
  const response = await axiosInstance.get('/actividades/recientes');
  return response.data;
};
