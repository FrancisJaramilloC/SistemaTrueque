import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createArticulo, uploadArticuloImagen } from '../../src/services/articulosService';

const CATEGORIAS = [
  { label: 'Electrónica', value: 'electronica' },
  { label: 'Ropa', value: 'ropa' },
  { label: 'Hogar', value: 'hogar' },
  { label: 'Deportes', value: 'deportes' },
  { label: 'Libros', value: 'libros' },
  { label: 'Juguetes', value: 'juguetes' },
  { label: 'Otros', value: 'otros' },
];

export default function AddScreen() {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'electronica',
    estado_articulo: 'disponible',
    condicion: 'usado',
  });
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar una imagen');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar una foto');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.titulo.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el artículo');
      return;
    }

    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return;
    }

    if (formData.titulo.length < 3) {
      Alert.alert('Error', 'El título debe tener al menos 3 caracteres');
      return;
    }

    if (formData.descripcion.length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Crear artículo
      const articulo = await createArticulo(formData);

      // Subir imagen si existe
      if (imageUri) {
        try {
          await uploadArticuloImagen(articulo.id, imageUri);
        } catch (imgError) {
          console.error('Error al subir imagen:', imgError);
          // Continuar aunque falle la imagen
        }
      }

      Alert.alert(
        '¡Éxito!',
        'Artículo publicado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setFormData({
                titulo: '',
                descripcion: '',
                categoria: 'electronica',
                estado_articulo: 'disponible',
                condicion: 'usado',
              });
              setImageUri(null);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al publicar artículo');
      console.error('Error al publicar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Publicar Artículo</Text>
        <Text style={styles.subtitle}>Comparte lo que quieres intercambiar</Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Título del artículo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Laptop HP en buen estado"
              value={formData.titulo}
              onChangeText={(value) => handleChange('titulo', value)}
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu artículo, su condición, características..."
              value={formData.descripcion}
              onChangeText={(value) => handleChange('descripcion', value)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!loading}
            />
            <Text style={styles.helperText}>
              {formData.descripcion.length}/500 caracteres
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {CATEGORIAS.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      formData.categoria === cat.value && styles.categoryChipActive,
                    ]}
                    onPress={() => handleChange('categoria', cat.value)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.categoria === cat.value && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Condición *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {[
                  { label: 'Nuevo', value: 'nuevo' },
                  { label: 'Como nuevo', value: 'como_nuevo' },
                  { label: 'Usado', value: 'usado' },
                  { label: 'Aceptable', value: 'aceptable' },
                ].map((cond) => (
                  <TouchableOpacity
                    key={cond.value}
                    style={[
                      styles.categoryChip,
                      formData.condicion === cond.value && styles.categoryChipActive,
                    ]}
                    onPress={() => handleChange('condicion', cond.value)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.condicion === cond.value && styles.categoryTextActive,
                      ]}
                    >
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Imagen</Text>
            
            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImage}
                disabled={loading}
              >
                <Ionicons name="image-outline" size={24} color="#d4742f" />
                <Text style={styles.imageButtonText}>Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imageButton}
                onPress={takePhoto}
                disabled={loading}
              >
                <Ionicons name="camera-outline" size={24} color="#d4742f" />
                <Text style={styles.imageButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                  disabled={loading}
                >
                  <Ionicons name="close-circle" size={32} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Publicar Artículo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b100e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#97594e',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b100e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0d5ce',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1b100e',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#97594e',
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0d5ce',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: '#d4742f',
    borderColor: '#d4742f',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b100e',
  },
  categoryTextActive: {
    color: '#fff',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0d5ce',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    color: '#d4742f',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 16,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  submitButton: {
    backgroundColor: '#d4742f',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
