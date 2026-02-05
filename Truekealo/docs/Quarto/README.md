# 📚 Documentación de Truekealo

Documentación completa del Sistema de Intercambio Truekealo, construida con [Quarto](https://quarto.org/).

## 📋 Contenido

La documentación está organizada en las siguientes secciones:

### 📖 Documentación Principal
- **[Introducción](docs/introduccion.qmd)** - Descripción general del sistema
- **[Instalación](docs/instalacion.qmd)** - Guía paso a paso para configurar el proyecto
- **[Guía del Desarrollador](docs/guia-desarrollador.qmd)** - Arquitectura, stack tecnológico y flujos
- **[Guía del Usuario](docs/guia-usuario.qmd)** - Manual de usuario final
- **[Guía del Administrador](docs/guia-administrador.qmd)** - Guía para gestionar el sistema

### 🏗️ Especificaciones Técnicas
- **[Arquitectura](docs/especificaciones/arquitectura.qmd)** - Arquitectura del sistema, patrones de diseño
- **[Base de Datos](docs/especificaciones/base-datos.qmd)** - Esquema de base de datos, relaciones
- **[API REST](docs/especificaciones/api.qmd)** - Documentación completa de endpoints
- **[Seguridad](docs/especificaciones/seguridad.qmd)** - Implementación de seguridad y mejores prácticas

### 🎓 Prácticas y Evaluación
- **[APE 007](docs/practicas/ape-007.qmd)** - Práctica interactiva del curso
- **[Pruebas](docs/practicas/pruebas.qmd)** - Guía de testing y QA
- **[Despliegue](docs/practicas/despliegue.qmd)** - Estrategias de despliegue en producción

## 🚀 Construcción de la Documentación

### Requisitos Previos

```bash
# Instalar Quarto (https://quarto.org/docs/get-started/)
# En Windows:
choco install quarto
# O descargar desde: https://quarto.org/docs/get-started/

# Verificar instalación
quarto --version
```

### Compilar la Documentación

```bash
# Renderizar el sitio web completo
quarto render

# Renderizar solo un archivo
quarto render docs/introduccion.qmd

# Renderizar en watch mode (desarrollo)
quarto preview
```

### Ver la Documentación Localmente

```bash
# Iniciar servidor de desarrollo con preview automático
quarto preview

# Abrirá en http://localhost:3000 automáticamente
```

### Generar Output en Diferentes Formatos

```bash
# Sitio web (HTML - default)
quarto render --to html

# PDF
quarto render --to pdf

# Word
quarto render --to docx

# Revealjs (presentación)
quarto render --to revealjs
```

## 📁 Estructura de Archivos

```
Truekealo/
├── _quarto.yml              # Configuración principal de Quarto
├── docs/
│   ├── index.qmd            # Landing page
│   ├── introduccion.qmd      # Introducción al sistema
│   ├── instalacion.qmd       # Guía de instalación
│   ├── guia-desarrollador.qmd
│   ├── guia-usuario.qmd
│   ├── guia-administrador.qmd
│   ├── especificaciones/
│   │   ├── arquitectura.qmd
│   │   ├── base-datos.qmd
│   │   ├── api.qmd
│   │   └── seguridad.qmd
│   ├── practicas/
│   │   ├── ape-007.qmd
│   │   ├── pruebas.qmd
│   │   └── despliegue.qmd
│   ├── assets/
│   │   ├── custom.scss       # Estilos SCSS personalizados
│   │   ├── custom.css        # Estilos CSS adicionales
│   │   └── logo.svg          # Logo del proyecto
│   └── _output/              # Generado automáticamente
│       └── index.html        # Sitio web compilado
└── README.md                 # Este archivo
```

## 🎨 Personalización

### Modificar Colores y Temas

Edita `_quarto.yml`:

```yaml
format:
  html:
    theme: cosmo
    # O cambiar a: flatly, darkly, cyborg, spacelab, etc.
    css:
      - docs/assets/custom.css
    scss:
      - docs/assets/custom.scss
```

### Cambiar Colores Principales

Modifica `docs/assets/custom.scss`:

```scss
$primary: #009688;      // Color principal (teal)
$secondary: #61dafb;    // Color secundario (azul React)
$success: #4caf50;      // Verde
```

### Agregar Nuevas Páginas

1. Crea archivo `.qmd` en `docs/`
2. Agrega referencia en `_quarto.yml`:

```yaml
website:
  sidebar:
    - title: "Mi Sección"
      contents:
        - docs/mi-pagina.qmd
```

## 📊 Características de Quarto Usadas

✅ **Markdown extendido** - Sintaxis mejorada de Markdown  
✅ **Diagramas Mermaid** - Flowcharts, diagramas ER, gráficos  
✅ **Code blocks** - Coloreado por sintaxis  
✅ **Matemáticas** - LaTeX/KaTeX para ecuaciones  
✅ **Tablas** - Tablas complejas  
✅ **Navegación** - Navbar personalizado, sidebar, search  
✅ **Responsive** - Diseño adaptable a móvil  
✅ **Exportación** - HTML, PDF, Word, etc.  

## 🔗 Integración con Producción

### Desplegar en GitHub Pages

```bash
# 1. Construir documentación
quarto render

# 2. Crear rama gh-pages
git checkout --orphan gh-pages

# 3. Mover contenido compilado
cp -r docs/_output/* .
rm -rf docs/

# 4. Commit y push
git add .
git commit -m "Deploy documentation"
git push origin gh-pages

# 5. En GitHub: Settings → Pages → Source: gh-pages
```

### Desplegar en Netlify

```bash
# 1. Conectar repo a Netlify
# 2. Configurar build command:
quarto render

# 3. Configurar publish directory:
docs/_output

# 4. Deploy automático en cada push
```

### Desplegar en Vercel

```bash
# 1. Crear vercel.json
cat > vercel.json << EOF
{
  "buildCommand": "quarto render",
  "outputDirectory": "docs/_output"
}
EOF

# 2. Conectar repo a Vercel
# 3. Deploy automático
```

## 📝 Escribir Documentación

### Estructura Recomendada de Página

```markdown
---
title: "Título de la Página"
author: "Nombre del Autor"
date: today
---

# Título Principal (H1)

Párrafo introductorio...

## Sección Principal (H2)

### Subsección (H3)

Contenido...

#### Subsubsección (H4)

#### Tabla de Contenidos

| Columna 1 | Columna 2 |
|-----------|-----------|
| Dato 1    | Dato 2    |

### Código

```python
def ejemplo():
    return "Hello, World!"
```

### Diagrama

```{mermaid}
graph TD
    A[Inicio] --> B{Decisión}
    B -->|Sí| C[Fin]
    B -->|No| D[Otro camino]
```

### Cita/Callout

> **Nota:** Algo importante que debes saber

---

**Versión:** 1.0  
**Última actualización:** `r format(Sys.Date(), '%d de %B de %Y')`
```

## 🔍 Búsqueda

El sitio incluye búsqueda completa. Usuarios pueden:

1. Hacer clic en el icono de búsqueda (🔍) en la navbar
2. Escribir términos de búsqueda
3. Los resultados aparecen en tiempo real

## 🌐 Hosting

Opciones recomendadas:

- **GitHub Pages** - Gratuito, integrado con GitHub
- **Netlify** - Gratuito hasta cierto límite
- **Vercel** - Gratuito, muy rápido
- **AWS S3 + CloudFront** - Escalable, profesional
- **tu propio servidor** - Control total

## 📦 Exportar Documentación

```bash
# Exportar como PDF
quarto render --to pdf
# Genera: docs/_output/index.pdf

# Exportar como Word
quarto render --to docx
# Genera: docs/_output/index.docx

# Exportar como presentación
quarto render docs/especificaciones/arquitectura.qmd --to revealjs
```

## 🐛 Troubleshooting

### Quarto no se encuentra

```bash
# En Windows:
quarto check

# En Mac/Linux:
which quarto
```

### Build falla

```bash
# Limpiar y reconstruir
rm -rf docs/_output
quarto render
```

### Cambios no aparecen

```bash
# Ctrl+Shift+R (reload sin cache)
# O ejecutar:
quarto render
```

## 📖 Recursos Útiles

- [Documentación oficial de Quarto](https://quarto.org/)
- [Quarto Gallery](https://quarto.org/docs/gallery/)
- [Markdown Cheatsheet](https://www.markdownguide.org/cheat-sheet/)
- [Mermaid Diagram Syntax](https://mermaid.js.org/syntax/flowchart.html)

## 📄 Licencia

Esta documentación es parte del Proyecto Truekealo.

## 👥 Contribuir

Para contribuir a la documentación:

1. Fork el repositorio
2. Crea rama: `git checkout -b feature/mi-cambio`
3. Haz commits descriptivos
4. Push a la rama
5. Abre Pull Request

## 📧 Soporte

¿Preguntas? Contacta:
- **Email:** soporte@truekealo.com
- **GitHub Issues:** [Crear issue](https://github.com/truekealo/truekealo/issues)

---

**Última actualización:** `r format(Sys.Date(), '%d de %B de %Y')`  
**Versión:** 1.0.0
