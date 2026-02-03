const SearchBar = ({ filters, onChange }) => {
  return (
    <div className="filters-section" aria-label="Filtros de búsqueda">
      <div className="search-box">
        <input
          type="text"
          name="search"
          className="filter-input"
          placeholder="Buscar artículos..."
          value={filters.search}
          onChange={onChange}
          aria-label="Buscar artículos"
        />
      </div>

      <div className="filter-group">
        <select
          name="categoria"
          className="filter-select"
          value={filters.categoria}
          onChange={onChange}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
          <option value="libros">Libros</option>
          <option value="juguetes">Juguetes</option>
          <option value="deportes">Deportes</option>
          <option value="hogar">Hogar</option>
          <option value="otros">Otros</option>
        </select>

        <select
          name="condicion"
          className="filter-select"
          value={filters.condicion}
          onChange={onChange}
          aria-label="Filtrar por condición"
        >
          <option value="">Todas las condiciones</option>
          <option value="excelente">Excelente</option>
          <option value="buena">Buena</option>
          <option value="aceptable">Aceptable</option>
          <option value="defectuosa">Defectuosa</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
