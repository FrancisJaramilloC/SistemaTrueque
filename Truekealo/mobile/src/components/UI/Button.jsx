import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/config';

export default function Button({
  onPress,
  title,
  variant = 'primary', // primary, secondary, danger, outline
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
      },
      secondary: {
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
      },
      danger: {
        backgroundColor: COLORS.danger,
        borderColor: COLORS.danger,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: COLORS.primary,
        borderWidth: 2,
      },
      success: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        minHeight: 36,
      },
      md: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        minHeight: 44,
      },
      lg: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        minHeight: 52,
      },
    };
    return sizes[size] || sizes.md;
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'secondary') return COLORS.text;
    return '#FFFFFF';
  };

  const getTextSize = () => {
    const sizes = {
      sm: TYPOGRAPHY.sizes.sm,
      md: TYPOGRAPHY.sizes.base,
      lg: TYPOGRAPHY.sizes.lg,
    };
    return sizes[size] || TYPOGRAPHY.sizes.base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        {
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getTextSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOWS.md,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
