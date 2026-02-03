import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/UI/Button';
import Input from '../../src/components/UI/Input';
import { authService } from '../../src/services/authService';
import { COLORS, TYPOGRAPHY, SPACING, VALIDATION, ERROR_MESSAGES } from '../../src/constants/config';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    ubicacion: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.nombre_completo.length < VALIDATION.MIN_NAME_LENGTH) {
      newErrors.nombre_completo = `El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`;
    }

    if (!formData.email.trim()) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.password.trim()) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      newErrors.password = ERROR_MESSAGES.WEAK_PASSWORD;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Por favor inicia sesión.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error) {
      let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;

      if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message?.includes('fetch')) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      } else if (error.status === 400) {
        errorMessage = ERROR_MESSAGES.EMAIL_EXISTS;
      }

      Alert.alert('Error en el registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a la comunidad de trueque
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={formData.nombre_completo}
            onChangeText={(value) => handleChange('nombre_completo', value)}
            error={errors.nombre_completo}
            icon="person-outline"
            editable={!loading}
          />

          <Input
            label="Email"
            placeholder="tu@email.com"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon="mail-outline"
            editable={!loading}
          />

          <Input
            label="Teléfono"
            placeholder="+56 9 1234 5678"
            value={formData.telefono}
            onChangeText={(value) => handleChange('telefono', value)}
            keyboardType="phone-pad"
            error={errors.telefono}
            icon="call-outline"
            editable={!loading}
          />

          <Input
            label="Ubicación"
            placeholder="Ciudad, Región"
            value={formData.ubicacion}
            onChangeText={(value) => handleChange('ubicacion', value)}
            error={errors.ubicacion}
            icon="location-outline"
            editable={!loading}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
            editable={!loading}
          />

          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock-closed-outline"
            editable={!loading}
          />

          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al registrarte aceptas nuestros términos y condiciones
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.md,
  },
  registerButton: {
    marginTop: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
