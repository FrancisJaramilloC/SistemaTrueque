import api from './api';
import * as SecureStore from 'expo-secure-store';

// Registrar nuevo usuario
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Iniciar sesión
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  console.log('📝 Login response:', response.data.access_token ? 'Token recibido' : 'NO HAY TOKEN');
  if (response.data.access_token) {
    await SecureStore.setItemAsync('token', response.data.access_token);
    await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
    console.log('✅ Token guardado en SecureStore');
  }
  return response.data;
};

// Cerrar sesión
export const logout = async () => {
  try {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Obtener información del usuario actual
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Actualizar perfil del usuario
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

// Cambiar contraseña
export const changePassword = async (passwordData) => {
  const response = await api.post('/auth/change-password', passwordData);
  return response.data;
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
};

// Resetear contraseña con token
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// Obtener token almacenado
export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync('token');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

// Obtener usuario almacenado
export const getStoredUser = async () => {
  try {
    const userData = await SecureStore.getItemAsync('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};
