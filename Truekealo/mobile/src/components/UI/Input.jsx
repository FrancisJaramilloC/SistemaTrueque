import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/config';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={COLORS.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            icon && { paddingLeftMultiplier: 0 },
            multiline && { textAlignVertical: 'top' },
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={
            secureTextEntry && !showPassword
          }
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    fontFamily: 'System',
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
  },
});
