import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EmptyState = ({ icon = 'cube-outline', message = 'No hay elementos para mostrar', description = '' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color="#97594e" />
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1b100e',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#97594e',
    textAlign: 'center',
  },
});
