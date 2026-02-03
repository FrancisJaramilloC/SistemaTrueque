import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getArticuloById } from '../../src/services/articulosService';
import { createPropuesta } from '../../src/services/propuestasService';
import { getMisArticulos } from '../../src/services/articulosService';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/constants/config';

export default function ArticuloDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [articulo, setArticulo] = useState(null);
  const [misArticulos, setMisArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPropuestaModal, setShowPropuestaModal] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [enviandoPropuesta, setEnviandoPropuesta] = useState(false);

  useEffect(() => {
    loadArticulo();
    loadMisArticulos();
  }, [id]);

  const loadArticulo = async () => {
    try {
      const data = await getArticuloById(id);
      setArticulo(data);
    } catch (error) {
      console.error('Error al cargar artículo:', error);
      Alert.alert('Error', 'No se pudo cargar el artículo');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadMisArticulos = async () => {
    try {
      const data = await getMisArticulos();
      // Filtrar solo artículos disponibles
      const disponibles = data.filter(art => art.estado_articulo === 'disponible');
      setMisArticulos(disponibles);
    } catch (error) {
      console.error('Error al cargar mis artículos:', error);
    }
  };

  const handleEnviarPropuesta = async () => {
    if (!selectedArticulo) {
      Alert.alert('Selecciona un artículo', 'Debes seleccionar uno de tus artículos para intercambiar');
      return;
    }

    Alert.alert(
      'Confirmar propuesta',
      `¿Quieres proponer tu "${selectedArticulo.titulo}" por "${articulo.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setEnviandoPropuesta(true);
            try {
              await createPropuesta({
                articulo_ofrecido_id: selectedArticulo.id,
                articulo_solicitado_id: articulo.id,
              });

              Alert.alert(
                '¡Propuesta enviada!',
                'El dueño del artículo recibirá tu propuesta',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.detail || 'No se pudo enviar la propuesta'
              );
            } finally {
              setEnviandoPropuesta(false);
              setShowPropuestaModal(false);
            }
          },
        },
      ]
    );
  };

  const handleContactar = () => {
    if (articulo?.propietario?.id) {
      router.push(`/conversacion/${articulo.propietario.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4742f" />
      </View>
    );
  }

  if (!articulo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Artículo no encontrado</Text>
      </View>
    );
  }

  const esPropio = user?.id === articulo.propietario?.id;
  const imageUrl = articulo.imagen_url 
    ? `${API_URL}${articulo.imagen_url}`
    : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagen del artículo */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={80} color="#e0d5ce" />
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}

        {/* Botón volver */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1b100e" />
        </TouchableOpacity>

        {/* Información del artículo */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{articulo.titulo}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{articulo.categoria}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{articulo.descripcion}</Text>
          </View>

          {/* Información del propietario */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propietario</Text>
            <View style={styles.propietarioCard}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle-outline" size={50} color="#d4742f" />
              </View>
              <View style={styles.propietarioInfo}>
                <Text style={styles.propietarioNombre}>
                  {articulo.propietario?.nombre_completo || 'Usuario'}
                </Text>
                {articulo.propietario?.ubicacion && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color="#97594e" />
                    <Text style={styles.ubicacionText}>
                      {articulo.propietario.ubicacion}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Estado */}
          <View style={styles.estadoContainer}>
            <Ionicons
              name={
                articulo.estado_articulo === 'disponible'
                  ? 'checkmark-circle'
                  : 'close-circle'
              }
              size={20}
              color={articulo.estado_articulo === 'disponible' ? '#10b981' : '#97594e'}
            />
            <Text
              style={[
                styles.estadoText,
                articulo.estado_articulo !== 'disponible' && styles.estadoNoDisponible,
              ]}
            >
              {articulo.estado_articulo === 'disponible' ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      {!esPropio && articulo.estado_articulo === 'disponible' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactar}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#d4742f" />
            <Text style={styles.contactButtonText}>Contactar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.propuestaButton}
            onPress={() => setShowPropuestaModal(true)}
          >
            <Ionicons name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.propuestaButtonText}>Proponer intercambio</Text>
          </TouchableOpacity>
        </View>
      )}

      {esPropio && (
        <View style={styles.footer}>
          <Text style={styles.ownArticleText}>Este es tu artículo</Text>
        </View>
      )}

      {/* Modal de propuesta */}
      {showPropuestaModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu artículo</Text>
              <TouchableOpacity onPress={() => setShowPropuestaModal(false)}>
                <Ionicons name="close" size={24} color="#1b100e" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {misArticulos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={60} color="#e0d5ce" />
                  <Text style={styles.emptyText}>
                    No tienes artículos disponibles
                  </Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setShowPropuestaModal(false);
                      router.push('/(tabs)/add');
                    }}
                  >
                    <Text style={styles.addButtonText}>Publicar artículo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                misArticulos.map((art) => (
                  <TouchableOpacity
                    key={art.id}
                    style={[
                      styles.articuloOption,
                      selectedArticulo?.id === art.id && styles.articuloOptionSelected,
                    ]}
                    onPress={() => setSelectedArticulo(art)}
                  >
                    <View style={styles.articuloOptionContent}>
                      {art.imagen_url ? (
                        <Image
                          source={{ uri: `${API_URL}${art.imagen_url}` }}
                          style={styles.articuloOptionImage}
                        />
                      ) : (
                        <View style={styles.articuloOptionNoImage}>
                          <Ionicons name="image-outline" size={30} color="#e0d5ce" />
                        </View>
                      )}
                      <View style={styles.articuloOptionInfo}>
                        <Text style={styles.articuloOptionTitle}>{art.titulo}</Text>
                        <Text style={styles.articuloOptionCategoria}>
                          {art.categoria}
                        </Text>
                      </View>
                    </View>
                    {selectedArticulo?.id === art.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#d4742f" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {misArticulos.length > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPropuestaModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.enviarButton,
                    (!selectedArticulo || enviandoPropuesta) && styles.enviarButtonDisabled,
                  ]}
                  onPress={handleEnviarPropuesta}
                  disabled={!selectedArticulo || enviandoPropuesta}
                >
                  {enviandoPropuesta ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.enviarButtonText}>Enviar propuesta</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  errorText: {
    fontSize: 16,
    color: '#97594e',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 300,
  },
  noImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#97594e',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1b100e',
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#fff4ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffd7b8',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4742f',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b100e',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
  },
  propietarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0d5ce',
  },
  avatarContainer: {
    marginRight: 12,
  },
  propietarioInfo: {
    flex: 1,
  },
  propietarioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b100e',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ubicacionText: {
    fontSize: 14,
    color: '#97594e',
    marginLeft: 4,
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estadoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  estadoNoDisponible: {
    color: '#97594e',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0d5ce',
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d4742f',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4742f',
  },
  propuestaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4742f',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  propuestaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ownArticleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#97594e',
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5ce',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b100e',
  },
  modalScroll: {
    maxHeight: 400,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#97594e',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#d4742f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  articuloOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0d5ce',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  articuloOptionSelected: {
    borderColor: '#d4742f',
    backgroundColor: '#fff4ed',
  },
  articuloOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  articuloOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  articuloOptionNoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articuloOptionInfo: {
    flex: 1,
  },
  articuloOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b100e',
    marginBottom: 4,
  },
  articuloOptionCategoria: {
    fontSize: 14,
    color: '#97594e',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0d5ce',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0d5ce',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b100e',
  },
  enviarButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#d4742f',
    alignItems: 'center',
  },
  enviarButtonDisabled: {
    opacity: 0.5,
  },
  enviarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
