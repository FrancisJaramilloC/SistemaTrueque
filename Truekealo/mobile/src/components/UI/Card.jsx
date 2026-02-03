import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/config';

export default function Card({
  children,
  onPress,
  style,
  padding = true,
  shadow = 'md',
  ...props
}) {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card,
        padding && { padding: SPACING.md },
        shadow && SHADOWS[shadow],
        style,
      ]}
      {...props}
    >
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
});
