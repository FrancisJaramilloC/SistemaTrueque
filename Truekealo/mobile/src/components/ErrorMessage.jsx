import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ErrorMessage = ({ message = 'Ha ocurrido un error', onRetry = null }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  message: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#991b1b',
  },
});
