import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    try {
      const token = await SecureStore.getItemAsync('token');
      console.log('🔑 Token obtenido:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(options.headers);

    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: { ...headers, Authorization: headers.Authorization ? '***' : undefined }
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 API Response:', {
        url,
        status: response.status,
        ok: response.ok
      });

      // Manejar errores de autenticación
      if (response.status === 401) {
        try {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
        } catch (e) {
          console.error('Error al limpiar tokens:', e);
        }
      }

      // Parsear respuesta
      const contentType = response.headers.get('content-type');
      let data;
      
      // Si es 204 No Content, no hay body para parsear
      if (response.status === 204) {
        data = null;
      } else if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error('❌ API Error:', { status: response.status, data });
        const error = new Error(data?.detail || data?.message || 'Error en la petición');
        error.response = { status: response.status, data };
        throw error;
      }

      return { data, status: response.status, headers: response.headers };
    } catch (error) {
      console.error(`❌ Error en ${options.method || 'GET'} ${endpoint}:`, error.message);
      if (error.message === 'Network request failed') {
        console.error('💡 Verifica que:');
        console.error('   - El backend esté corriendo en http://192.168.0.3:8001');
        console.error('   - Para Android Emulator, usa 10.0.2.2 (edita config.js)');
        console.error('   - Para dispositivo físico, usa 192.168.0.3 (actual)');
      }
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async postFormData(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token for auth
    const headers = {};
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          ...options.headers,
        },
        body: formData,
      });

      // Manejar errores de autenticación
      if (response.status === 401) {
        try {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
        } catch (e) {
          console.error('Error al limpiar tokens:', e);
        }
      }

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(data.detail || data.message || 'Error en la petición');
        error.response = { status: response.status, data };
        throw error;
      }

      return { data, status: response.status, headers: response.headers };
    } catch (error) {
      console.error(`Error en POST FormData ${endpoint}:`, error);
      throw error;
    }
  }
}

const api = new ApiService();

export default api;
