// src/components/LoadingSpinner.tsx - Loading Component
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LoadingSpinnerProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.text.secondary }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default LoadingSpinner;