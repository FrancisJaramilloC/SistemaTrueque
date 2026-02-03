import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AccessibleText from '../../src/components/AccessibleText';
import AccessibleView from '../../src/components/AccessibleView';
import { getArticulos } from '../../src/services/articulosService';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorMessage } from '../../src/components/ErrorMessage';

export default function ExploreScreen() {
  const router = useRouter();
  const [articulos, setArticulos] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos', 'Electrónica', 'Ropa', 'Libros', 'Deportes', 'Hogar', 'Juguetes', 'Otros']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticulos();
  }, []);

  useEffect(() => {
    filterArticulos();
  }, [searchText, selectedCategoria, articulos]);

  const loadArticulos = async () => {
    try {
      setError('');
      const data = await getArticulos({ estado: 'disponible' });
      
      // Log para debug
      console.log('📦 Artículos cargados:', data?.length);
      if (data && data.length > 0) {
        const categoriasUnicas = data.map(a => a.categoria).filter(cat => cat && cat.trim().length > 0);
        console.log('📂 Categorías en artículos:', categoriasUnicas);
        console.log('🏷️ Primer artículo:', data[0]);
      }
      
      setArticulos(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar artículos');
      console.error('Error al cargar artículos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterArticulos = () => {
    let filtered = articulos;

    // Filtrar por búsqueda
    if (searchText) {
      filtered = filtered.filter(
        (art) =>
          art.titulo?.toLowerCase().includes(searchText.toLowerCase()) ||
          art.descripcion?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrar por categoría (case-insensitive)
    if (selectedCategoria !== 'Todos') {
      filtered = filtered.filter(
        (art) => art.categoria?.toLowerCase() === selectedCategoria.toLowerCase()
      );
    }

    setFilteredArticulos(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArticulos();
  };

  const handleArticuloPress = (articulo) => {
    router.push(`/articulo/${articulo.id}`);
  };

  if (loading) {
    return <LoadingScreen message="Cargando artículos..." />;
  }

  const renderArticulo = ({ item }) => {
    const imageUrl = item.imagen_url 
      ? item.imagen_url.startsWith('http') 
        ? item.imagen_url 
        : `http://192.168.0.3:8001${item.imagen_url}`
      : null;

    return (
      <TouchableOpacity
        style={styles.articuloCard}
        onPress={() => handleArticuloPress(item)}
      >
        <View style={styles.articuloImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.articuloImage}
            />
          ) : (
            <View style={[styles.articuloImage, styles.noImage]}>
              <Ionicons name="image-outline" size={32} color="#97594e" />
            </View>
          )}
        </View>
        <View style={styles.articuloInfo}>
          <AccessibleText style={styles.articuloTitle} numberOfLines={2}>
            {item.titulo}
          </AccessibleText>
          <AccessibleText style={styles.articuloCategoria}>{item.categoria}</AccessibleText>
          <AccessibleText style={styles.articuloDescripcion} numberOfLines={1}>
            {item.descripcion}
          </AccessibleText>
          <View style={styles.articuloFooter}>
            <AccessibleText style={styles.articuloEstado}>{item.estado_articulo}</AccessibleText>
            <AccessibleText style={styles.articuloOwner} numberOfLines={1}>
              {item.propietario?.nombre_completo}
            </AccessibleText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AccessibleView style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#97594e" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar artículos..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#97594e"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#97594e" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de categoría */}
      <View style={styles.categoriasContainer}>
        <FlatList
          horizontal
          data={categorias}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoriaChip,
                selectedCategoria === item && styles.categoriaChipActive,
              ]}
              onPress={() => setSelectedCategoria(item)}
            >
              <AccessibleText
                style={[
                  styles.categoriaText,
                  selectedCategoria === item && styles.categoriaTextActive,
                ]}
              >
                {item}
              </AccessibleText>
            </TouchableOpacity>
          )}
        />
      </View>

      {error && <ErrorMessage message={error} />}

      {/* Lista de artículos en grid */}
      <FlatList
        data={filteredArticulos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderArticulo}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d4742f']} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            message="No se encontraron artículos"
            description={searchText ? 'Intenta con otros términos de búsqueda' : 'No hay artículos disponibles'}
          />
        }
      />
    </AccessibleView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0d5ce',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1b100e',
  },
  categoriasContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5ce',
    minHeight: 60,
  },
  categoriaChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e0d5ce',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriaChipActive: {
    backgroundColor: '#d4742f',
    borderColor: '#d4742f',
  },
  categoriaText: {
    fontSize: 13,
    color: '#1b100e',
    fontWeight: '700',
  },
  categoriaTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  articuloCard: {
    flex: 1,
    backgroundColor: '#fcf9f8',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0d5ce',
    marginHorizontal: 6,
  },
  articuloImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5e9e6',
    overflow: 'hidden',
  },
  articuloImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5e9e6',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  articuloInfo: {
    padding: 12,
  },
  articuloTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b100e',
    marginBottom: 4,
  },
  articuloCategoria: {
    fontSize: 11,
    color: '#d4742f',
    fontWeight: '600',
    marginBottom: 6,
  },
  articuloDescripcion: {
    fontSize: 12,
    color: '#97594e',
    marginBottom: 8,
    lineHeight: 16,
  },
  articuloFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articuloEstado: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  articuloOwner: {
    fontSize: 10,
    color: '#97594e',
    flex: 1,
    textAlign: 'right',
  },
});
