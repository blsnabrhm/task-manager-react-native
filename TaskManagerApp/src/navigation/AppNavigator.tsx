// src/navigation/AppNavigator.tsx - Navigation Configuration
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { TasksScreen, LoginScreen } from '../screens';
import { LoadingSpinner } from '../components';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <TasksScreen /> : <LoginScreen />;
};

const AppNavigator: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppNavigator;