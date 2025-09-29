// src/navigation/AppNavigator.tsx - Navigation Configuration
import React, { useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AnimationProvider, useAnimation } from '../contexts/AnimationContext';
import { TasksScreen, LoginScreen, DashboardScreen, NotesScreen, NoteEditor } from '../screens';
import { LoadingSpinner } from '../components';

const AuthenticatedApp: React.FC = () => {
  // All hooks must be declared at the top before any conditional logic
  const { isAuthenticated, isLoading } = useAuth();
  const { fadeAnimation, triggerScreenTransition } = useAnimation();
  const { theme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<string>('Dashboard');
  const [navParams, setNavParams] = useState<any>({});
  const [parentScreen, setParentScreen] = useState<string>('Dashboard');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <Animated.View style={[
        styles.screenContainer, 
        { 
          opacity: fadeAnimation,
          backgroundColor: theme.background.primary 
        }
      ]}>
        <LoginScreen />
      </Animated.View>
    );
  }

  // Enhanced navigation object with animations and parameters
  const navigation = {
    navigate: (screenName: string, params?: any) => {
      triggerScreenTransition(() => {
        // Set parent screen based on navigation logic
        if (screenName === 'Notes' && currentScreen === 'Dashboard') {
          setParentScreen('Dashboard');
        } else if (screenName === 'NoteEditor' && currentScreen === 'Notes') {
          setParentScreen('Notes');
        } else if (screenName === 'TaskManager' && currentScreen === 'Dashboard') {
          setParentScreen('Dashboard');
        } else {
          // Keep current parent if navigating within sub-screens
          setParentScreen(currentScreen);
        }
        setCurrentScreen(screenName);
        setNavParams(params || {});
      });
    },
    goBack: () => {
      triggerScreenTransition(() => {
        // For Notes screen, always go back to Dashboard
        if (currentScreen === 'Notes') {
          setCurrentScreen('Dashboard');
          setParentScreen('Dashboard');
        } else if (currentScreen === 'NoteEditor') {
          setCurrentScreen('Notes');
          setParentScreen('Dashboard');
        } else {
          // Default fallback to Dashboard
          setCurrentScreen('Dashboard');
          setParentScreen('Dashboard');
        }
        setNavParams({});
      });
    },
  };

  // Render current screen with animation
  const getCurrentScreen = () => {
    const route = { params: navParams };
    
    switch (currentScreen) {
      case 'TaskManager':
        return <TasksScreen navigation={navigation} />;
      case 'Notes':
        return <NotesScreen navigation={navigation} />;
      case 'NoteEditor':
        return <NoteEditor navigation={navigation} route={route} />;
      case 'Dashboard':
      default:
        return <DashboardScreen navigation={navigation} />;
    }
  };

  return (
    <Animated.View style={[
      styles.screenContainer, 
      { 
        opacity: fadeAnimation,
        backgroundColor: theme.background.primary 
      }
    ]}>
      {getCurrentScreen()}
    </Animated.View>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimationProvider>
          <AuthenticatedApp />
        </AnimationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    // Background color is now set dynamically in the component based on theme
  },
});

export default AppNavigator;