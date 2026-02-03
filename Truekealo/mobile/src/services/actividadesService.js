import api from './api';

// Obtener estadísticas del dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/actividades/dashboard');
  return response.data;
};

// Obtener actividades recientes
export const getActividadesRecientes = async () => {
  const response = await api.get('/actividades/recientes');
  return response.data;
};
