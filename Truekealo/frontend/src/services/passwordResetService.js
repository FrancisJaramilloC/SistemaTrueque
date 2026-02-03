import axiosInstance from './axiosConfig';

// Solicitar token de recuperación de contraseña
export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/request-password-reset', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verificar que el token es válido
export const verifyToken = async (token) => {
  try {
    const response = await axiosInstance.get(`/auth/verify-token/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Restablecer contraseña con el token
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
