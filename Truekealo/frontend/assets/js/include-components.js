/**
 * Component Inclusion System
 * Allows HTML pages to reference common components without server-side rendering
 * Usage: Add data-include="sidebar" to any element to load that component
 */

class ComponentIncluder {
  constructor() {
    const inTemplates = window.location.pathname.includes('/templates/');
    const base = inTemplates ? '../includes/' : 'includes/';
    this.components = {
      'sidebar': `${base}sidebar.html`,
      'head-meta': `${base}head-meta.html`,
      'tailwind-config': `${base}tailwind-config.html`,
      'footer-scripts': `${base}footer-scripts.html`,
      'accessibility-menu': `${base}accessibility-menu.html`
    };
  }

  async init() {
    // Cargar el menú de accesibilidad primero (sin data-include)
    try {
      const response = await fetch('../includes/accessibility-menu.html');
      if (response.ok) {
        const html = await response.text();
        const placeholder = document.querySelector('[data-include="accessibility-menu"]');
        if (placeholder) {
          placeholder.innerHTML = html;
        }
      }
    } catch (error) {
      console.error('Error loading accessibility menu:', error);
    }

    const elements = document.querySelectorAll('[data-include]');
    
    for (const element of elements) {
      const componentName = element.getAttribute('data-include');
      const componentPath = this.components[componentName];
      
      if (componentPath) {
        try {
          const response = await fetch(componentPath);
          if (!response.ok) throw new Error(`Failed to load ${componentName}`);
          
          const html = await response.text();
          element.innerHTML = html;
          
          // Re-initialize event listeners for loaded components
          this.initializeLoadedComponent(componentName, element);
        } catch (error) {
          console.error(`Error loading component "${componentName}":`, error);
        }
      }
    }
  }

  initializeLoadedComponent(name, element) {
    if (name === 'sidebar') {
      // Mark active navigation link based on current page
      const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
      const navLinks = element.querySelectorAll('nav a');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
          link.classList.add('bg-active-light', 'dark:bg-active-dark', 'text-primary');
          link.classList.remove('hover:bg-active-light', 'dark:hover:bg-active-dark');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ComponentIncluder().init();
  });
} else {
  new ComponentIncluder().init();
}
