// src/navigation/AppNavigator.tsx - Navigation Configuration
import React from 'react';
import { TasksScreen } from '../screens';
import { ThemeProvider } from '../contexts/ThemeContext';

// For now, we're just showing the TasksScreen directly
// When you add React Navigation later, this will handle routing
const AppNavigator: React.FC = () => {
  return (
    <ThemeProvider>
      <TasksScreen />
    </ThemeProvider>
  );
};

export default AppNavigator;