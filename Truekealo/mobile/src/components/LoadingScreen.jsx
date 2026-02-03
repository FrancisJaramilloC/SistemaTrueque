import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingScreen = ({ message = 'Cargando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#d4742f" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#1b100e',
  },
});
