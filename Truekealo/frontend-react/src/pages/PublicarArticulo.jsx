import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArticulo, uploadArticuloImagen } from '../services/articulosService';
import FileUpload from '../components/FileUpload';

const PublicarArticulo = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    condicion: 'buena',
  });
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (file) => {
    setImagen(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.titulo || formData.titulo.length < 3) {
        setError('El título debe tener al menos 3 caracteres');
        setLoading(false);
        return;
      }

      if (!formData.descripcion || formData.descripcion.length < 10) {
        setError('La descripción debe tener al menos 10 caracteres');
        setLoading(false);
        return;
      }

      if (!formData.categoria) {
        setError('Debes seleccionar una categoría');
        setLoading(false);
        return;
      }

      // Preparar datos del artículo (categoría ya está en minúsculas del select)
      const datosArticulo = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        condicion: formData.condicion,
        estado_articulo: 'disponible'
      };

      console.log('Enviando artículo:', datosArticulo);

      // Crear artículo
      const articulo = await createArticulo(datosArticulo);

      // Si hay imagen, subirla
      if (imagen) {
        await uploadArticuloImagen(articulo.id, imagen);
      }

      navigate('/mis-articulos');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al publicar artículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publicar-container">
      <div className="page-header">
        <h1>Publicar Artículo </h1>
        <p>Comparte un artículo para intercambiar</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="publicar-form">
        <div className="form-group">
          <label htmlFor="titulo">Título del Artículo *</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Cámara Canon EOS 80D"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Describe tu artículo, incluye detalles importantes..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="electronica">💻 Electrónica</option>
              <option value="ropa">👕 Ropa</option>
              <option value="libros">📚 Libros</option>
              <option value="juguetes">🧸 Juguetes</option>
              <option value="deportes">⚽ Deportes</option>
              <option value="hogar">🏠 Hogar</option>
              <option value="otros">📦 Otros</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="condicion">Condición *</label>
            <select
              id="condicion"
              name="condicion"
              value={formData.condicion}
              onChange={handleChange}
              required
            >
              <option value="excelente">Excelente</option>
              <option value="buena">Buena</option>
              <option value="aceptable">Aceptable</option>
              <option value="defectuosa">Defectuosa</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <FileUpload
            id="imagen"
            label="Imagen del Artículo"
            onFileChange={handleImageChange}
            maxSizeMB={5}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/mis-articulos')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publicando...' : '📤 Publicar Artículo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicarArticulo;
