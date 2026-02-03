import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticuloById, updateArticulo } from '../services/articulosService';
import { CATEGORIAS_ARTICULO } from '../utils/constants';

const EditArticulo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    condicion: 'buena',
    valor_estimado: '',
  });

  useEffect(() => {
    loadArticulo();
  }, [id]);

  const loadArticulo = async () => {
    try {
      const data = await getArticuloById(id);
      setFormData({
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
        condicion: data.condicion || 'buena',
        valor_estimado: data.valor_estimado || '',
      });
    } catch (err) {
      setError('Error al cargar el artículo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData.titulo.trim()) {
        setError('El título es obligatorio');
        return;
      }
      if (!formData.descripcion.trim()) {
        setError('La descripción es obligatoria');
        return;
      }
      if (!formData.categoria) {
        setError('Debes seleccionar una categoría');
        return;
      }

      await updateArticulo(id, formData);
      setSuccess('Artículo actualizado correctamente');
      setTimeout(() => {
        navigate(`/articulo/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar artículo');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando artículo...</p>
      </div>
    );
  }

  return (
    <div className="edit-articulo-container">
      <h1>Editar Artículo</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="articulo-form">
        <div className="form-group">
          <label htmlFor="titulo">Título del Artículo *</label>
          <input
            id="titulo"
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Laptop Dell Inspiron 15"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe detalladamente el estado y características del artículo..."
            rows="5"
            required
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
              {CATEGORIAS_ARTICULO.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="condicion">Condición</label>
            <select
              id="condicion"
              name="condicion"
              value={formData.condicion}
              onChange={handleChange}
            >
              <option value="excelente">Excelente</option>
              <option value="buena">Buena</option>
              <option value="aceptable">Aceptable</option>
              <option value="defectuosa">Defectuosa</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="valor_estimado">Valor Estimado (opcional)</label>
          <input
            id="valor_estimado"
            type="number"
            name="valor_estimado"
            value={formData.valor_estimado}
            onChange={handleChange}
            placeholder="Ej: 500000"
            min="0"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticulo;
