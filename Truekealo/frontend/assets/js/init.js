/**
 * Script de inicialización para páginas de Truekealo
 * Conecta funcionalidades del frontend con el backend
 */

// ==================== Verificar Autenticación ====================
function verificarAutenticacion() {
    const paginasPublicas = ['login.html', 'crear-cuenta.html', 'recuperar-contrasena.html'];
    const paginaActual = window.location.pathname.split('/').pop();
    
    if (!paginasPublicas.includes(paginaActual) && !TokenManager.isAuthenticated()) {
        window.location.href = '/templates/login.html';
        return false;
    }
    return true;
}

// ==================== Cerrar Sesión ====================
function configurarCerrarSesion() {
    // Buscar todos los botones de cerrar sesión
    const botonesLogout = document.querySelectorAll('[data-action="logout"], button:has(.material-symbols-outlined:contains("logout"))');
    
    botonesLogout.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                AuthAPI.logout();
            }
        });
    });
    
    // Específico para la página de configuración
    const btnLogoutConfig = document.querySelector('button:has(h3:contains("Cerrar Sesión"))');
    if (btnLogoutConfig) {
        btnLogoutConfig.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                AuthAPI.logout();
            }
        });
    }
}

// ==================== Publicar Artículo ====================
function configurarPublicarArticulo() {
    const formPublicar = document.getElementById('formPublicarArticulo');
    
    if (formPublicar) {
        formPublicar.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                titulo: document.getElementById('tituloArticulo').value,
                descripcion: document.getElementById('descripcionArticulo').value,
                categoria: document.getElementById('categoriaArticulo').value,
                condicion: document.getElementById('condicionArticulo').value,
                valor_estimado: parseFloat(document.getElementById('valorEstimado').value) || 0
            };
            
            try {
                const articulo = await ArticulosAPI.create(formData);
                Toast.success('Artículo publicado correctamente');
                setTimeout(() => {
                    window.location.href = '/templates/mis-articulos.html';
                }, 1500);
            } catch (error) {
                console.error('Error al publicar:', error);
                Toast.error('Error al publicar el artículo');
            }
        });
    }
}

// ==================== Eliminar Artículo ====================
function configurarEliminarArticulo() {
    const botonesEliminar = document.querySelectorAll('[data-action="delete-articulo"]');
    
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', async (e) => {
            e.preventDefault();
            const articuloId = boton.dataset.articuloId;
            
            if (confirm('¿Estás seguro que deseas eliminar este artículo?')) {
                try {
                    await ArticulosAPI.delete(articuloId);
                    Toast.success('Artículo eliminado correctamente');
                    boton.closest('[data-articulo]').remove();
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    Toast.error('Error al eliminar el artículo');
                }
            }
        });
    });
}

// ==================== Cargar Mis Artículos ====================
async function cargarMisArticulos() {
    const contenedorArticulos = document.getElementById('misArticulosContainer');
    
    if (contenedorArticulos) {
        try {
            const articulos = await ArticulosAPI.getMisArticulos();
            
            if (articulos.length === 0) {
                contenedorArticulos.innerHTML = `
                    <div class="text-center py-12">
                        <p class="text-text-muted-light dark:text-text-muted-dark">
                            No tienes artículos publicados
                        </p>
                        <a href="/templates/publicar.html" class="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90">
                            Publicar Artículo
                        </a>
                    </div>
                `;
                return;
            }
            
            contenedorArticulos.innerHTML = articulos.map(articulo => `
                <div class="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm" data-articulo="${articulo.id}">
                    <h3 class="font-bold text-lg text-text-light dark:text-text-dark">${articulo.titulo}</h3>
                    <p class="text-text-muted-light dark:text-text-muted-dark text-sm mt-2">${articulo.descripcion}</p>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-sm text-primary">${articulo.categoria}</span>
                        <div class="flex gap-2">
                            <button onclick="editarArticulo(${articulo.id})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                Editar
                            </button>
                            <button data-action="delete-articulo" data-articulo-id="${articulo.id}" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            configurarEliminarArticulo();
        } catch (error) {
            console.error('Error al cargar artículos:', error);
            Toast.error('Error al cargar tus artículos');
        }
    }
}

// ==================== Cargar Explorar ====================
async function cargarArticulosExplorar() {
    const contenedorExplorar = document.getElementById('explorarContainer');
    
    if (contenedorExplorar) {
        try {
            const articulos = await ArticulosAPI.getAll({ limit: 20 });
            
            contenedorExplorar.innerHTML = articulos.map(articulo => `
                <div class="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm">
                    <h3 class="font-bold text-lg text-text-light dark:text-text-dark">${articulo.titulo}</h3>
                    <p class="text-text-muted-light dark:text-text-muted-dark text-sm mt-2">${articulo.descripcion}</p>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-sm text-primary">${articulo.categoria}</span>
                        <button onclick="verDetalle(${articulo.id})" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 text-sm">
                            Ver Detalle
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error al cargar artículos:', error);
            Toast.error('Error al cargar artículos');
        }
    }
}

// ==================== Funciones Globales ====================
window.editarArticulo = function(id) {
    window.location.href = `/templates/editar-articulo.html?id=${id}`;
};

window.verDetalle = function(id) {
    window.location.href = `/templates/detalle-articulo.html?id=${id}`;
};

// ==================== Inicialización ====================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    // Configurar funcionalidades
    configurarCerrarSesion();
    configurarPublicarArticulo();
    cargarMisArticulos();
    cargarArticulosExplorar();
    
    console.log('✅ Truekealo inicializado correctamente');
});
