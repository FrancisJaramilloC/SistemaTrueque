/**
 * ==================== Truekealo API Client ====================
 * Módulo de comunicación con el backend FastAPI
 * Proporciona funciones para interactuar con la API REST
 */

// ==================== Configuración ====================
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// ==================== Utilidades ====================
const safeToast = {
    success: (message) => {
        if (typeof Toast !== 'undefined' && Toast.success) {
            Toast.success(message);
        } else {
            console.log('✅', message);
        }
    },
    error: (message) => {
        if (typeof Toast !== 'undefined' && Toast.error) {
            Toast.error(message);
        } else {
            console.error('❌', message);
        }
    },
    warning: (message) => {
        if (typeof Toast !== 'undefined' && Toast.warning) {
            Toast.warning(message);
        } else {
            console.warn('⚠️', message);
        }
    }
};

// ==================== Gestión de Tokens ====================
class TokenManager {
    static getToken() {
        return localStorage.getItem('access_token');
    }

    static setToken(token) {
        localStorage.setItem('access_token', token);
    }

    static removeToken() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
    }

    static getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    static setUserData(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    static isAuthenticated() {
        return !!this.getToken();
    }
}

// ==================== Cliente HTTP ====================
class HTTPClient {
    /**
     * Realiza una petición HTTP con manejo de errores y reintentos
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} - Respuesta de la API
     */
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        // Configuración por defecto
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Agregar token de autenticación si existe
        const token = TokenManager.getToken();
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        // Combinar opciones
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, finalOptions);
            
            // Manejar 401 (Unauthorized) - token expirado o inválido
            // Pero NO redirigir si es el endpoint de login
            if (response.status === 401 && !endpoint.includes('/auth/login')) {
                console.warn('Token expirado o inválido, cerrando sesión...');
                TokenManager.removeToken();
                window.location.href = '/templates/login.html';
                throw new APIError('Sesión expirada', 401, {});
            }

            const data = await response.json();

            if (!response.ok) {
                throw new APIError(
                    data.detail || 'Error en la petición',
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError('Error de conexión con el servidor', 0, error);
        }
    }

    static async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}

// ==================== Error Personalizado ====================
class APIError extends Error {
    constructor(message, statusCode, data) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.data = data;
    }
}

// ==================== API de Autenticación ====================
class AuthAPI {
    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} - Usuario creado
     */
    static async register(userData) {
        try {
            const response = await HTTPClient.post('/auth/register', userData);
            safeToast.success('Cuenta creada exitosamente');
            return response;
        } catch (error) {
            safeToast.error(error.message || 'Error al crear la cuenta');
            throw error;
        }
    }

    /**
     * Inicia sesión con email y contraseña
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} - Token y datos del usuario
     */
    static async login(email, password) {
        try {
            const response = await HTTPClient.post('/auth/login', {
                email,
                password
            });

            // Guardar token y datos del usuario
            TokenManager.setToken(response.access_token);
            TokenManager.setUserData(response.user);

            // Login silencioso: sin toast
            return response;
        } catch (error) {
            safeToast.error(error.message || 'Usuario o contraseña incorrecta');
            throw error;
        }
    }

    /**
     * Cierra la sesión del usuario
     */
    static logout() {
        TokenManager.removeToken();
        safeToast.success('Sesión cerrada');
        window.location.href = '/templates/login.html';
    }

    /**
     * Obtiene los datos del usuario actual
     * @returns {Promise<Object>} - Datos del usuario
     */
    static async getCurrentUser() {
        try {
            const response = await HTTPClient.get('/auth/me');
            TokenManager.setUserData(response);
            return response;
        } catch (error) {
            if (error.statusCode === 401) {
                this.logout();
            }
            throw error;
        }
    }
}

// ==================== API de Artículos ====================
class ArticulosAPI {
    /**
     * Obtiene todos los artículos con paginación y filtros
     * @param {Object} params - Parámetros de consulta
     * @returns {Promise<Array>} - Lista de artículos
     */
    static async getAll(params = {}) {
        try {
            return await HTTPClient.get('/articulos/', params);
        } catch (error) {
            safeToast.error('Error al cargar artículos');
            throw error;
        }
    }

    /**
     * Obtiene un artículo por ID
     * @param {number} id - ID del artículo
     * @returns {Promise<Object>} - Datos del artículo
     */
    static async getById(id) {
        try {
            return await HTTPClient.get(`/articulos/${id}`);
        } catch (error) {
            safeToast.error('Artículo no encontrado');
            throw error;
        }
    }

    /**
     * Obtiene los artículos del usuario actual
     * @returns {Promise<Array>} - Lista de artículos
     */
    static async getMisArticulos() {
        try {
            return await HTTPClient.get('/articulos/mis-articulos');
        } catch (error) {
            safeToast.error('Error al cargar tus artículos');
            throw error;
        }
    }

    /**
     * Crea un nuevo artículo
     * @param {Object} articuloData - Datos del artículo
     * @returns {Promise<Object>} - Artículo creado
     */
    static async create(articuloData) {
        try {
            const response = await HTTPClient.post('/articulos/', articuloData);
            safeToast.success('Artículo publicado exitosamente');
            return response;
        } catch (error) {
            safeToast.error(error.message || 'Error al publicar artículo');
            throw error;
        }
    }

    /**
     * Actualiza un artículo existente
     * @param {number} id - ID del artículo
     * @param {Object} articuloData - Datos actualizados
     * @returns {Promise<Object>} - Artículo actualizado
     */
    static async update(id, articuloData) {
        try {
            const response = await HTTPClient.put(`/articulos/${id}`, articuloData);
            safeToast.success('Artículo actualizado');
            return response;
        } catch (error) {
            safeToast.error('Error al actualizar artículo');
            throw error;
        }
    }

    /**
     * Elimina un artículo
     * @param {number} id - ID del artículo
     * @returns {Promise<void>}
     */
    static async delete(id) {
        try {
            await HTTPClient.delete(`/articulos/${id}`);
            safeToast.success('Artículo eliminado');
        } catch (error) {
            safeToast.error('Error al eliminar artículo');
            throw error;
        }
    }
}

// ==================== API de Propuestas ====================
class PropuestasAPI {
    /**
     * Crea una nueva propuesta de intercambio
     * @param {Object} propuestaData - Datos de la propuesta
     * @returns {Promise<Object>} - Propuesta creada
     */
    static async create(propuestaData) {
        try {
            const response = await HTTPClient.post('/propuestas/', propuestaData);
            safeToast.success('Propuesta enviada');
            return response;
        } catch (error) {
            safeToast.error(error.message || 'Error al enviar propuesta');
            throw error;
        }
    }

    /**
     * Obtiene las propuestas recibidas
     * @returns {Promise<Array>} - Lista de propuestas
     */
    static async getRecibidas() {
        try {
            return await HTTPClient.get('/propuestas/recibidas');
        } catch (error) {
            safeToast.error('Error al cargar propuestas recibidas');
            throw error;
        }
    }

    /**
     * Obtiene las propuestas enviadas
     * @returns {Promise<Array>} - Lista de propuestas
     */
    static async getEnviadas() {
        try {
            return await HTTPClient.get('/propuestas/enviadas');
        } catch (error) {
            safeToast.error('Error al cargar propuestas enviadas');
            throw error;
        }
    }

    /**
     * Obtiene una propuesta por ID
     * @param {number} id - ID de la propuesta
     * @returns {Promise<Object>} - Datos de la propuesta
     */
    static async getById(id) {
        try {
            return await HTTPClient.get(`/propuestas/${id}`);
        } catch (error) {
            safeToast.error('Propuesta no encontrada');
            throw error;
        }
    }

    /**
     * Actualiza el estado de una propuesta
     * @param {number} id - ID de la propuesta
     * @param {string} estado - Nuevo estado
     * @returns {Promise<Object>} - Propuesta actualizada
     */
    static async updateEstado(id, estado) {
        try {
            const response = await HTTPClient.patch(`/propuestas/${id}`, { estado });
            safeToast.success('Propuesta actualizada');
            return response;
        } catch (error) {
            safeToast.error('Error al actualizar propuesta');
            throw error;
        }
    }

    /**
     * Obtiene un resumen de propuestas para el usuario actual
     * @returns {Promise<{pendientes:number,total:number}>}
     */
    static async getResumen() {
        try {
            return await HTTPClient.get('/propuestas/resumen');
        } catch (error) {
            safeToast.error('Error al calcular intercambios pendientes');
            throw error;
        }
    }
}

// ==================== API de Actividades ====================
class ActividadesAPI {
    /**
     * Obtiene las actividades recientes del usuario
     */
    static async getRecientes(limite = 10) {
        try {
            return await HTTPClient.get('/actividades/recientes', { limite });
        } catch (error) {
            safeToast.error('Error al cargar actividades');
            throw error;
        }
    }

    /**
     * Obtiene el conteo de intercambios activos (con conversación)
     */
    static async getIntercambiosActivos() {
        try {
            return await HTTPClient.get('/actividades/intercambios-activos');
        } catch (error) {
            safeToast.error('Error al cargar intercambios activos');
            throw error;
        }
    }
}

// ==================== API de Mensajes ====================
class MensajesAPI {
    /**
     * Lista las conversaciones del usuario con el último mensaje y no leídos
     */
    static async getConversaciones() {
        try {
            return await HTTPClient.get('/mensajes/conversaciones');
        } catch (error) {
            safeToast.error('Error al cargar conversaciones');
            throw error;
        }
    }

    /**
     * Obtiene una conversación completa con otro usuario (marca mensajes como leídos)
     */
    static async getConversacion(usuarioId) {
        try {
            return await HTTPClient.get(`/mensajes/conversacion/${usuarioId}`);
        } catch (error) {
            safeToast.error(error.message || 'Error al cargar conversación');
            throw error;
        }
    }

    /**
     * Envía un mensaje a otro usuario
     */
    static async enviar(destinatario_id, contenido) {
        try {
            return await HTTPClient.post('/mensajes/', { destinatario_id, contenido });
        } catch (error) {
            safeToast.error(error.message || 'Error al enviar mensaje');
            throw error;
        }
    }

    /**
     * Devuelve el conteo de mensajes no leídos para el usuario actual
     */
    static async getUnreadCount() {
        try {
            return await HTTPClient.get('/mensajes/unread-count');
        } catch (error) {
            safeToast.error('Error al actualizar contador de mensajes');
            throw error;
        }
    }
}

// ==================== Middleware de Autenticación ====================
class AuthMiddleware {
    /**
     * Verifica si el usuario está autenticado
     * Redirige al login si no lo está
     */
    static requireAuth() {
        if (!TokenManager.isAuthenticated()) {
            safeToast.warning('Debes iniciar sesión para acceder');
            window.location.href = '/templates/login.html';
            return false;
        }
        return true;
    }

    /**
     * Verifica la autenticación y carga datos del usuario
     */
    static async checkAuth() {
        if (this.requireAuth()) {
            try {
                return await AuthAPI.getCurrentUser();
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                return null;
            }
        }
    }
}

// ==================== Exportar para uso global ====================
window.TruekealoAPI = {
    Auth: AuthAPI,
    Articulos: ArticulosAPI,
    Propuestas: PropuestasAPI,
    Mensajes: MensajesAPI,
    Actividades: ActividadesAPI,
    TokenManager,
    AuthMiddleware,
    APIError
};

// ==================== Uso en el código ====================
/*
EJEMPLO DE USO:

// 1. Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await TruekealoAPI.Auth.login(email, password);
        window.location.href = '/templates/dashboard.html';
    } catch (error) {
        console.error('Error en login:', error);
    }
});

// 2. Obtener artículos
async function cargarArticulos() {
    try {
        const articulos = await TruekealoAPI.Articulos.getAll({ limit: 20, categoria: 'electronica' });
        mostrarArticulos(articulos);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 3. Crear artículo
async function publicarArticulo() {
    const articuloData = {
        titulo: 'Laptop HP',
        descripcion: 'Laptop en buen estado',
        categoria: 'electronica',
        valor_estimado: 500,
        condicion: 'Usado'
    };
    
    try {
        const articulo = await TruekealoAPI.Articulos.create(articuloData);
        console.log('Artículo creado:', articulo);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 4. Proteger páginas
// Al inicio de páginas que requieren autenticación:
if (TruekealoAPI.AuthMiddleware.requireAuth()) {
    // Cargar contenido de la página
    cargarContenido();
}
*/
