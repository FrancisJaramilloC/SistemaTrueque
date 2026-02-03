import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, API_URL } from '../constants/config';

const getCategoryIcon = (categoria) => {
  const icons = {
    'Electrónica': 'laptop-outline',
    'Ropa': 'shirt-outline',
    'Hogar': 'home-outline',
    'Deportes': 'football-outline',
    'Libros': 'book-outline',
    'Juguetes': 'game-controller-outline',
    'Otros': 'cube-outline',
  };
  return icons[categoria] || 'cube-outline';
};

export default function ArticuloCard({ articulo, onPress }) {
  // Obtener la URL base sin el /api/v1
  const baseUrl = API_URL.replace('/api/v1', '');
  const imageUrl = articulo.imagen_url
    ? `${baseUrl}${articulo.imagen_url}`
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color={COLORS.textSecondary} />
          </View>
        )}
        {articulo.estado_articulo === 'disponible' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(articulo.categoria)}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.categoryText}>{articulo.categoria}</Text>
          </View>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{articulo.condicion}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {articulo.titulo}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {articulo.descripcion}
        </Text>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {articulo.propietario?.ubicacion || 'Sin ubicación'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightPrimary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightPrimary,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  conditionBadge: {
    backgroundColor: COLORS.active,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  conditionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
});
