import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { updateProfile } from '../src/services/authService';
import { COLORS, SPACING, TYPOGRAPHY } from '../src/constants/config';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    ubicacion: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre_completo: user.nombre_completo || '',
        email: user.email || '',
        telefono: user.telefono || '',
        ubicacion: user.ubicacion || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre_completo.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es obligatorio');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'El email no es válido');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile(formData);
      updateUser(updatedUser);
      Alert.alert('Éxito', 'Perfil actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nombre_completo}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.nombre_completo}
                onChangeText={(value) => handleChange('nombre_completo', value)}
                placeholder="Ingresa tu nombre completo"
                placeholderTextColor={COLORS.textSecondary}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.telefono}
                onChangeText={(value) => handleChange('telefono', value)}
                placeholder="Número de teléfono"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.ubicacion}
                onChangeText={(value) => handleChange('ubicacion', value)}
                placeholder="Ciudad, País"
                placeholderTextColor={COLORS.textSecondary}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  form: {
    padding: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    paddingVertical: 0,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
