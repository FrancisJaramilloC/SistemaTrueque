import { useState, useEffect } from 'react';
import { getArticulos } from '../services/articulosService';
import { getImageUrl, getCategoryIcon, truncateText } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const Explorar = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    condicion: '',
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    loadArticulos();
  }, [debouncedSearch, filters.categoria, filters.condicion]);

  const loadArticulos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.condicion) params.condicion = filters.condicion;

      const data = await getArticulos(params);
      // Filtrar artículos intercambiados para no mostrarlos en el explorador
      const articulosDisponibles = data.filter(
        art => art.estado_articulo !== 'intercambiado'
      );
      setArticulos(articulosDisponibles);
    } catch (error) {
      console.error('Error al cargar artículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="explorar-container">
      <div className="page-header">
        <h1>Explorar Artículos</h1>
        <p>Encuentra artículos para intercambiar</p>
      </div>

      {/* Filtros */}
      <SearchBar filters={filters} onChange={handleFilterChange} />

      {/* Lista de Artículos */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando artículos...</p>
        </div>
      ) : articulos.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron artículos</p>
        </div>
      ) : (
        <div className="articulos-grid">
          {articulos
            .filter((articulo) => articulo.estado_articulo === 'disponible')
            .map((articulo) => (
            <Link 
              to={`/articulo/${articulo.id}`} 
              key={articulo.id} 
              className="articulo-card"
            >
              <div className="articulo-image">
                <img 
                  src={getImageUrl(articulo.imagen_url)} 
                  alt={articulo.titulo}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {articulo.estado_articulo === 'disponible' && (
                  <span className="badge badge-success">Disponible</span>
                )}
              </div>

              <div className="articulo-content">
                <div className="articulo-header">
                  <span className="categoria-badge">
                    {getCategoryIcon(articulo.categoria)} {articulo.categoria}
                  </span>
                  <span className="condicion-badge">{articulo.condicion}</span>
                </div>

                <h3>{articulo.titulo}</h3>
                <p className="articulo-description">
                  {truncateText(articulo.descripcion, 80)}
                </p>

                <div className="articulo-footer">
                  <div className="owner-info">
                    <span>👤 {articulo.propietario?.nombre_completo}</span>
                  </div>
                  {articulo.propietario?.ubicacion && (
                    <span className="location">📍 {articulo.propietario.ubicacion}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explorar;
