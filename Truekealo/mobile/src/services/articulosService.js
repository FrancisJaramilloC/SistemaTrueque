import api from './api';

// Obtener todos los artículos (con filtros opcionales)
export const getArticulos = async (params = {}) => {
  const response = await api.get('/articulos', { params });
  return response.data;
};

// Obtener un artículo por ID
export const getArticuloById = async (id) => {
  const response = await api.get(`/articulos/${id}`);
  return response.data;
};

// Obtener mis artículos
export const getMisArticulos = async () => {
  const response = await api.get('/articulos/mis-articulos');
  return response.data;
};

// Crear nuevo artículo
export const createArticulo = async (articuloData) => {
  const response = await api.post('/articulos', articuloData);
  return response.data;
};

// Actualizar artículo
export const updateArticulo = async (id, articuloData) => {
  const response = await api.put(`/articulos/${id}`, articuloData);
  return response.data;
};

// Eliminar artículo
export const deleteArticulo = async (id) => {
  const response = await api.delete(`/articulos/${id}`);
  // El backend retorna 204 No Content, así que no hay data
  return response.status === 204;
};

// Subir imagen de artículo
export const uploadArticuloImagen = async (id, imageUri) => {
  const formData = new FormData();
  
  // Crear objeto de imagen con la URI
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: type,
  });
  
  const response = await api.postFormData(`/articulos/${id}/imagen`, formData);
  return response.data;
};
