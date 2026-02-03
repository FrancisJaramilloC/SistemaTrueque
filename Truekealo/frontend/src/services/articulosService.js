import axiosInstance from './axiosConfig';

// Obtener todos los artículos (con filtros opcionales)
export const getArticulos = async (params = {}) => {
  const response = await axiosInstance.get('/articulos', { params });
  return response.data;
};

// Obtener un artículo por ID
export const getArticuloById = async (id) => {
  const response = await axiosInstance.get(`/articulos/${id}`);
  return response.data;
};

// Obtener mis artículos
export const getMisArticulos = async () => {
  const response = await axiosInstance.get('/articulos/mis-articulos');
  return response.data;
};

// Crear nuevo artículo
export const createArticulo = async (articuloData) => {
  const response = await axiosInstance.post('/articulos', articuloData);
  return response.data;
};

// Actualizar artículo
export const updateArticulo = async (id, articuloData) => {
  const response = await axiosInstance.put(`/articulos/${id}`, articuloData);
  return response.data;
};

// Eliminar artículo
export const deleteArticulo = async (id) => {
  const response = await axiosInstance.delete(`/articulos/${id}`);
  return response.data;
};

// Subir imagen de artículo
export const uploadArticuloImagen = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosInstance.post(`/articulos/${id}/imagen`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
