import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../src/constants/config';

export default function MiPerfilScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const getInitial = () => {
    return user?.nombre_completo?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <Text style={styles.userName}>{user?.nombre_completo || 'Usuario'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>NOMBRE COMPLETO</Text>
          <Text style={styles.infoValue}>{user?.nombre_completo || 'No registrado'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>EMAIL</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>TELÉFONO</Text>
          <Text style={styles.infoValue}>{user?.telefono || 'No registrado'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>UBICACIÓN</Text>
          <Text style={styles.infoValue}>{user?.ubicacion || 'No registrada'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/editar-perfil')}
        >
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.configButton}
          onPress={() => router.push('/configuracion')}
        >
          <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          <Text style={styles.configButtonText}>Configuración</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  placeholder: {
    width: 40,
  },
  avatarSection: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#E5E7EB',
  },
  infoSection: {
    backgroundColor: COLORS.card,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
  },
  infoItem: {
    paddingVertical: SPACING.md,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  actions: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    gap: SPACING.xs,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.md,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: SPACING.xs,
  },
  configButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
