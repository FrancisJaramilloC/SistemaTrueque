import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const articuloService = {
  // Obtener todos los artículos
  async getArticulos(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${API_ENDPOINTS.ARTICULOS.LIST}?${queryString}` : API_ENDPOINTS.ARTICULOS.LIST;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al obtener artículos' };
    }
  },

  // Obtener artículo por ID
  async getArticuloById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.ARTICULOS.DETAIL(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al obtener artículo' };
    }
  },

  // Obtener mis artículos
  async getMisArticulos() {
    try {
      const response = await api.get(API_ENDPOINTS.ARTICULOS.MY_ARTICLES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al obtener tus artículos' };
    }
  },

  // Crear artículo
  async createArticulo(articuloData) {
    try {
      const response = await api.post(API_ENDPOINTS.ARTICULOS.CREATE, articuloData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al crear artículo' };
    }
  },

  // Actualizar artículo
  async updateArticulo(id, articuloData) {
    try {
      const response = await api.put(API_ENDPOINTS.ARTICULOS.DETAIL(id), articuloData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar artículo' };
    }
  },

  // Eliminar artículo
  async deleteArticulo(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.ARTICULOS.DETAIL(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al eliminar artículo' };
    }
  },

  // Subir imagen
  async uploadImage(articuloId, imageUri) {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await api.postFormData(
        API_ENDPOINTS.ARTICULOS.UPLOAD_IMAGE(articuloId),
        formData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al subir imagen' };
    }
  },
};
