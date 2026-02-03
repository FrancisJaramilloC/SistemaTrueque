import axiosInstance from './axiosConfig';

// Registrar nuevo usuario
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Iniciar sesión
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Obtener información del usuario actual
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

// Actualizar perfil del usuario
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/profile', profileData);
  return response.data;
};

// Cambiar contraseña
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.post('/auth/change-password', passwordData);
  return response.data;
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (email) => {
  const response = await axiosInstance.post('/auth/request-password-reset', { email });
  return response.data;
};

// Verificar token de recuperación
export const verifyResetToken = async (token) => {
  const response = await axiosInstance.get(`/auth/verify-token/${token}`);
  return response.data;
};

// Resetear contraseña con token
export const resetPassword = async (token, newPassword) => {
  const response = await axiosInstance.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// Habilitar autenticación de dos factores
export const enable2FA = async () => {
  const response = await axiosInstance.post('/auth/enable-2fa');
  return response.data;
};

// Deshabilitar autenticación de dos factores
export const disable2FA = async () => {
  const response = await axiosInstance.post('/auth/disable-2fa');
  return response.data;
};
