import React, { useState } from 'react';
import {
  View,
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
import AccessibleText from '../../src/components/AccessibleText';
import AccessibleView from '../../src/components/AccessibleView';
import { useAuth } from '../../src/context/AuthContext';
import { authService } from '../../src/services/authService';
import { COLORS, TYPOGRAPHY, SPACING, VALIDATION, ERROR_MESSAGES } from '../../src/constants/config';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.EMAIL_REGEX.test(email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!password.trim()) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      newErrors.password = ERROR_MESSAGES.WEAK_PASSWORD;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ email, password });
      // Redirigir al home después del login exitoso
      router.replace('/(tabs)/home');
    } catch (error) {
      let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message === 'Network Error' || error.message?.includes('fetch')) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      } else if (error.response?.status === 401) {
        errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
      }

      Alert.alert('Error de autenticación', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <AccessibleView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AccessibleText style={styles.title}>Bienvenido a</AccessibleText>
          <AccessibleText style={styles.brandName}>Truekealo</AccessibleText>
          <AccessibleText style={styles.subtitle}>
            Sistema de trueque e intercambio comunitario
          </AccessibleText>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon="mail-outline"
            editable={!loading}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
            editable={!loading}
          />

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <AccessibleText style={styles.dividerText}>O</AccessibleText>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.registerContainer}>
          <AccessibleText style={styles.registerText}>¿No tienes cuenta?</AccessibleText>
          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <AccessibleText style={styles.registerLink}>Crear una</AccessibleText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <AccessibleText style={styles.footerText}>
            Al iniciar sesión aceptas nuestros términos y condiciones
          </AccessibleText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </AccessibleView>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  brandName: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  loginButton: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  registerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
