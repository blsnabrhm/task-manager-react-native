// App.tsx - Main Expo Application with TypeScript
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation';

export default function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light theme default to prevent initial flash
  },
});