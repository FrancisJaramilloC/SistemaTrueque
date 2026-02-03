import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/config';

export default function Loading({
  message = 'Cargando...',
  size = 'large',
  color = COLORS.primary,
  fullScreen = false,
}) {
  const Container = fullScreen ? View : View;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.text, { color }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '500',
  },
});
