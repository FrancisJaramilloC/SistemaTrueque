/* Truekealo - Main JavaScript */

// ==================== DOM Elements ====================
const html = document.documentElement;
const darkModeToggle = document.getElementById('darkModeToggle');
const profilePhotoInput = document.getElementById('profilePhoto');
const body = document.body;

// ==================== Dark Mode ====================
class DarkModeManager {
  constructor() {
    this.isDarkMode = this.getPreference();
    this.init();
  }

  getPreference() {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  init() {
    this.apply();
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => this.toggle());
    }
    // Listen to system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
      this.apply();
    });
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    this.apply();
    localStorage.setItem('darkMode', this.isDarkMode);
  }

  apply() {
    if (this.isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    }
    this.updateToggleIcon();
  }

  updateToggleIcon() {
    if (darkModeToggle) {
      const icon = darkModeToggle.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = this.isDarkMode ? 'light_mode' : 'dark_mode';
      }
    }
  }
}

// ==================== Form Utilities ====================
class FormHandler {
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
  }

  static showValidationError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'text-red-600 dark:text-red-400 text-xs mt-1';
    errorElement.textContent = message;
    // Accessible error messaging
    const errId = field.id ? `${field.id}-error` : `field-error-${Date.now()}`;
    errorElement.id = errId;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'assertive');
    
    const existingError = field.parentElement.querySelector('.text-red-600');
    if (existingError) {
      existingError.remove();
    }
    
    field.parentElement.appendChild(errorElement);
    field.setAttribute('aria-invalid', 'true');
    // Link field to error
    field.setAttribute('aria-describedby', errId);
  }

  static clearValidationError(field) {
    const error = field.parentElement.querySelector('.text-red-600');
    if (error) {
      error.remove();
    }
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }

  static validateName(name) {
    return typeof name === 'string' && name.trim().length >= 2;
  }

  static validateConfirmPassword(password, confirmPassword) {
    return password === confirmPassword && this.validatePassword(confirmPassword);
  }

  static validateNonPlaceholder(selectEl) {
    if (!selectEl) return false;
    // Consider the first option as placeholder
    return selectEl.selectedIndex > 0;
  }
}

// ==================== File Upload Handler ====================
class FileUploadHandler {
  constructor(inputElement) {
    this.input = inputElement;
    if (this.input) {
      this.init();
    }
  }

  init() {
    this.input.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // Drag and drop
    const dropZone = this.input.parentElement;
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
      dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    }
  }

  handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length) {
      Array.from(files).forEach(file => this.validateAndProcess(file));
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
      event.currentTarget.classList.add('bg-opacity-50');
    }
  }

  handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('bg-opacity-50');
  }

  handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.input.files = files;
      this.handleFileSelect({ target: this.input });
    }
  }

  validateAndProcess(file) {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      this.showError('Por favor, sube una imagen JPG o PNG');
      return;
    }

    if (file.size > maxSize) {
      this.showError('La imagen no debe exceder 5MB');
      return;
    }

    this.showPreview(file);
  }

  showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // You can update the preview image here
      console.log('Archivo listo para subir:', file.name);
    };
    reader.readAsDataURL(file);
  }

  showError(message) {
    console.error(message);
    // You can add toast notification here
  }
}

// ==================== Modal Handler ====================
class ModalManager {
  constructor() {
    this.modals = {};
    this.lastFocusedElement = null;
    this.init();
  }

  init() {
    // Find all modals
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modal => {
      const id = modal.id;
      if (id) {
        this.modals[id] = modal;
        this.attachCloseListener(modal);
      }
    });
  }

  attachCloseListener(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close(modal.id));
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close(modal.id);
      }
    });
  }

  open(modalId) {
    const modal = this.modals[modalId];
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Accessibility attributes
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      // Save focus and move focus into the modal
      this.lastFocusedElement = document.activeElement;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first) first.focus();
      // Trap focus within modal
      const trapHandler = (e) => {
        if (e.key === 'Tab') {
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          this.close(modal.id);
        }
      };
      modal._trapHandler = trapHandler;
      modal.addEventListener('keydown', trapHandler);
    }
  }

  close(modalId) {
    const modal = this.modals[modalId];
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      modal.removeAttribute('aria-modal');
      modal.removeAttribute('role');
      if (modal._trapHandler) {
        modal.removeEventListener('keydown', modal._trapHandler);
        modal._trapHandler = null;
      }
      // Restore focus
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
        this.lastFocusedElement = null;
      }
    }
  }
}

// ==================== Password Toggle ====================
class PasswordToggle {
  constructor() {
    this.init();
  }

  init() {
    const toggleButtons = document.querySelectorAll('[data-toggle-password]');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle(btn);
      });
    });
  }

  toggle(button) {
    const targetId = button.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      
      const icon = button.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = isPassword ? 'visibility_off' : 'visibility';
      }
    }
  }
}

// ==================== Navigation Active Link ====================
class NavigationHandler {
  constructor() {
    this.init();
  }

  init() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
        if (!link.hasAttribute('aria-current')) {
          link.setAttribute('aria-current', 'page');
        }
      }
    });
  }
}

// ==================== Form Submission Handler ====================
class FormSubmissionHandler {
  constructor() {
    this.init();
  }

  init() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
      // Live validation on blur for inputs
      form.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('blur', () => this.validateField(form, el));
      });
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const isValid = this.validateForm(form);
    if (!isValid) {
      Toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    const formData = new FormData(form);
    console.log('Formulario enviado:', Object.fromEntries(formData));
    this.showSuccessMessage(form);
  }

  validateField(form, el) {
    const id = form.id || '';
    const name = el.name || el.id || '';
    FormHandler.clearValidationError(el);

    // Generic required check
    if (el.hasAttribute('required') && !el.value) {
      FormHandler.showValidationError(el, 'Este campo es obligatorio');
      return false;
    }

    // Per-form/per-field specific rules
    if (id === 'loginForm') {
      if (name === 'email' && !FormHandler.validateEmail(el.value)) {
        FormHandler.showValidationError(el, 'Ingresa un correo válido');
        return false;
      }
      if (name === 'password' && !FormHandler.validatePassword(el.value)) {
        FormHandler.showValidationError(el, 'La contraseña debe tener al menos 8 caracteres');
        return false;
      }
    }

    if (id === 'registerForm') {
      if (name === 'name' && !FormHandler.validateName(el.value)) {
        FormHandler.showValidationError(el, 'Ingresa tu nombre (mínimo 2 caracteres)');
        return false;
      }
      if (name === 'email' && !FormHandler.validateEmail(el.value)) {
        FormHandler.showValidationError(el, 'Ingresa un correo válido');
        return false;
      }
      if (name === 'password' && !FormHandler.validatePassword(el.value)) {
        FormHandler.showValidationError(el, 'La contraseña debe tener al menos 8 caracteres');
        return false;
      }
      if (name === 'confirmPassword') {
        const pw = form.querySelector('#password');
        if (!FormHandler.validateConfirmPassword(pw?.value || '', el.value)) {
          FormHandler.showValidationError(el, 'Las contraseñas no coinciden');
          return false;
        }
      }
    }

    if (id === 'recoveryForm') {
      if (name === 'email' && !FormHandler.validateEmail(el.value)) {
        FormHandler.showValidationError(el, 'Ingresa un correo válido');
        return false;
      }
    }

    if (id === 'publishForm') {
      if (el.id === 'publishTitle' && el.value.trim().length < 3) {
        FormHandler.showValidationError(el, 'El título debe tener al menos 3 caracteres');
        return false;
      }
      if (el.id === 'publishDescription' && el.value.trim().length < 10) {
        FormHandler.showValidationError(el, 'La descripción debe tener al menos 10 caracteres');
        return false;
      }
      if (el.id === 'publishCategory' && !FormHandler.validateNonPlaceholder(el)) {
        FormHandler.showValidationError(el, 'Selecciona una categoría');
        return false;
      }
      if (el.id === 'publishCondition' && !FormHandler.validateNonPlaceholder(el)) {
        FormHandler.showValidationError(el, 'Selecciona el estado');
        return false;
      }
    }

    return true;
  }

  validateForm(form) {
    let valid = true;
    form.querySelectorAll('input, textarea, select').forEach(el => {
      const res = this.validateField(form, el);
      if (!res) valid = false;
    });
    return valid;
  }

  showSuccessMessage(form) {
    const message = document.createElement('div');
    message.className = 'bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-4';
    message.textContent = '✓ Cambios guardados correctamente';
    
    form.parentElement.insertBefore(message, form);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
}

// ==================== Table Handler ====================
class TableHandler {
  constructor() {
    this.init();
  }

  init() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      this.addRowHover(table);
    });
  }

  addRowHover(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        const isDark = document.documentElement.classList.contains('dark');
        row.style.backgroundColor = isDark ? 'var(--active-dark)' : 'var(--active-light)';
      });
      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = '';
      });
    });
  }
}

// ==================== Notification System ====================
class Toast {
  static show(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.notification-container') || this.createContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    // Accessibility: announce messages appropriately
    notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
    notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    notification.setAttribute('aria-atomic', 'true');
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  static createContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    container.setAttribute('aria-label', 'Notificaciones');
    document.body.appendChild(container);
    return container;
  }

  static success(message, duration) {
    this.show(message, 'success', duration);
  }

  static error(message, duration) {
    this.show(message, 'error', duration);
  }

  static warning(message, duration) {
    this.show(message, 'warning', duration);
  }
}

// ==================== API Communication ====================
class APIClient {
  static get baseURL() {
    return (window.APP_CONFIG && window.APP_CONFIG.apiBase) ? window.APP_CONFIG.apiBase : '/api';
  }

  static async get(endpoint) {
    try {
      const headers = {};
      const token = (window.APP_CONFIG && typeof window.APP_CONFIG.tokenProvider === 'function')
        ? window.APP_CONFIG.tokenProvider()
        : localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: (window.APP_CONFIG && window.APP_CONFIG.useCookies) ? 'include' : 'same-origin',
        headers
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('GET Error:', error);
      throw error;
    }
  }

  static async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {})
        },
        credentials: (window.APP_CONFIG && window.APP_CONFIG.useCookies) ? 'include' : 'same-origin',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('POST Error:', error);
      throw error;
    }
  }

  static async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {})
        },
        credentials: (window.APP_CONFIG && window.APP_CONFIG.useCookies) ? 'include' : 'same-origin',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('PUT Error:', error);
      throw error;
    }
  }

  static async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          ...(localStorage.getItem('auth_token') ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {})
        },
        credentials: (window.APP_CONFIG && window.APP_CONFIG.useCookies) ? 'include' : 'same-origin',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 204 || !contentType.includes('application/json')) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      console.error('DELETE Error:', error);
      throw error;
    }
  }
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  new DarkModeManager();
  new PasswordToggle();
  new NavigationHandler();
  new FormSubmissionHandler();
  new ModalManager();
  new TableHandler();
  new FileUploadHandler(profilePhotoInput);
  const publishImagesInput = document.getElementById('publishImages');
  new FileUploadHandler(publishImagesInput);

  console.log('Truekealo Frontend initialized');
});

// ==================== Utility Functions ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DarkModeManager,
    FormHandler,
    FileUploadHandler,
    ModalManager,
    PasswordToggle,
    NavigationHandler,
    FormSubmissionHandler,
    TableHandler,
      Toast,
    APIClient,
  };
}
