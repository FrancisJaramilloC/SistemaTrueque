import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getMisArticulos,
  deleteArticulo,
  updateArticulo,
} from '../src/services/articulosService';
import { COLORS, SPACING, TYPOGRAPHY, API_URL } from '../src/constants/config';

export default function MisArticulosScreen() {
  const router = useRouter();
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArticulos();
  }, []);

  const loadArticulos = async () => {
    try {
      const data = await getMisArticulos();
      console.log('📦 Mis artículos cargados:', data.length);
      setArticulos(data);
    } catch (error) {
      console.error('Error al cargar artículos:', error);
      Alert.alert('Error', 'No se pudieron cargar tus artículos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArticulos();
  };

  const handleEliminar = (id, titulo) => {
    Alert.alert(
      'Eliminar artículo',
      `¿Estás seguro de eliminar "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Eliminando artículo:', id);
              await deleteArticulo(id);
              console.log('✅ Artículo eliminado exitosamente');
              // Actualizar la lista localmente
              setArticulos(articulos.filter(art => art.id !== id));
              Alert.alert('Éxito', 'Artículo eliminado correctamente');
            } catch (error) {
              console.error('❌ Error al eliminar artículo:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar el artículo');
            }
          },
        },
      ]
    );
  };

  const handleMarcarNoDisponible = async (id, titulo, estadoActual) => {
    const nuevoEstado = estadoActual === 'disponible' ? 'no_disponible' : 'disponible';
    const textoAccion = nuevoEstado === 'no_disponible' ? 'marcar como no disponible' : 'marcar como disponible';
    
    Alert.alert(
      'Cambiar disponibilidad',
      `¿Deseas ${textoAccion} "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateArticulo(id, { estado_articulo: nuevoEstado });
              Alert.alert('Éxito', `Artículo ${nuevoEstado === 'no_disponible' ? 'no disponible' : 'disponible'}`);
              loadArticulos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el artículo');
            }
          },
        },
      ]
    );
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'disponible':
        return { backgroundColor: COLORS.success, text: 'Disponible', icon: 'checkmark-circle' };
      case 'intercambiado':
        return { backgroundColor: COLORS.primary, text: 'Intercambiado', icon: 'swap-horizontal' };
      case 'no_disponible':
        return { backgroundColor: COLORS.textSecondary, text: 'No disponible', icon: 'close-circle' };
      default:
        return { backgroundColor: COLORS.border, text: estado, icon: 'help-circle' };
    }
  };

  const getCategoriaIcon = (categoria) => {
    const iconMap = {
      'Electrónica': 'laptop',
      'electronica': 'laptop',
      'Ropa': 'shirt',
      'ropa': 'shirt',
      'Hogar': 'home',
      'hogar': 'home',
      'Deportes': 'basketball',
      'deportes': 'basketball',
      'Libros': 'book',
      'libros': 'book',
      'Juguetes': 'game-controller',
      'juguetes': 'game-controller',
      'Otros': 'apps',
      'otros': 'apps',
    };
    return iconMap[categoria] || 'apps';
  };

  const renderArticulo = ({ item }) => {
    const estadoBadge = getEstadoBadge(item.estado_articulo);
    const imageUrl = item.imagen_url 
      ? (item.imagen_url.startsWith('http') ? item.imagen_url : `${API_URL.replace('/api/v1', '')}${item.imagen_url}`)
      : null;

    return (
      <View style={styles.articuloCard}>
        <View style={styles.articuloHeader}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.articuloImagen}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.articuloImagen, styles.imagenPlaceholder]}>
              <Ionicons name="image-outline" size={32} color={COLORS.textSecondary} />
            </View>
          )}
          <View style={styles.articuloInfo}>
            <View style={styles.categoriaContainer}>
              <Ionicons name={getCategoriaIcon(item.categoria)} size={16} color={COLORS.primary} />
              <Text style={styles.categoriaText}>{item.categoria}</Text>
            </View>
            <Text style={styles.articuloTitulo} numberOfLines={2}>{item.titulo}</Text>
            <Text style={styles.articuloDescripcion} numberOfLines={2}>{item.descripcion}</Text>
            
            <View style={styles.metaInfo}>
              <View style={[styles.estadoBadge, { backgroundColor: estadoBadge.backgroundColor }]}>
                <Ionicons name={estadoBadge.icon} size={14} color="#FFF" />
                <Text style={styles.estadoText}>{estadoBadge.text}</Text>
              </View>
              <Text style={styles.condicionText}>Condición: {item.condicion || 'N/A'}</Text>
            </View>
            
            <Text style={styles.fechaText}>
              Publicado: {new Date(item.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.verButton]}
            onPress={() => router.push(`/articulo/${item.id}`)}
          >
            <Ionicons name="eye" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editarButton]}
            onPress={() => router.push(`/editar-articulo/${item.id}`)}
          >
            <Ionicons name="create" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.eliminarButton]}
            onPress={() => handleEliminar(item.id, item.titulo)}
          >
            <Ionicons name="trash" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {item.estado_articulo !== 'intercambiado' && (
          <TouchableOpacity
            style={styles.disponibilidadButton}
            onPress={() => handleMarcarNoDisponible(item.id, item.titulo, item.estado_articulo)}
          >
            <Text style={styles.disponibilidadButtonText}>
              {item.estado_articulo === 'disponible' ? 'Marcar no disponible' : 'Marcar disponible'}
            </Text>
          </TouchableOpacity>
        )}

        {item.estado_articulo === 'intercambiado' && (
          <View style={styles.intercambiadoNotice}>
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.success} />
            <Text style={styles.intercambiadoText}>Intercambio realizado</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Artículos</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/add')} 
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.subheader}>
        <Text style={styles.subheaderText}>Administra tus publicaciones</Text>
        <Text style={styles.countText}>{articulos.length} artículo(s)</Text>
      </View>

      <FlatList
        data={articulos}
        renderItem={renderArticulo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No tienes artículos publicados</Text>
            <TouchableOpacity
              style={styles.publicarButton}
              onPress={() => router.push('/(tabs)/add')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.publicarButtonText}>Publicar Artículo</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  addButton: {
    padding: SPACING.xs,
  },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subheaderText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
  },
  articuloCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articuloHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  articuloImagen: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  imagenPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  articuloInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoriaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  articuloTitulo: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  articuloDescripcion: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  estadoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: 4,
  },
  condicionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  fechaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  verButton: {
    backgroundColor: COLORS.primary,
  },
  editarButton: {
    backgroundColor: '#FF9800',
  },
  eliminarButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: 4,
  },
  disponibilidadButton: {
    backgroundColor: COLORS.textSecondary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  disponibilidadButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  intercambiadoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  intercambiadoText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  publicarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  publicarButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.xs,
  },
});
