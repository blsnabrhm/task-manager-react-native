// src/components/Header.tsx - Header Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  tasksCount: number;
  completedCount: number;
}

const Header: React.FC<HeaderProps> = ({ tasksCount, completedCount }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: theme.background.card, borderBottomColor: theme.border.light }]}>
      <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Task Manager</Text>
      <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
        {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'}
        {completedCount > 0 && ` • ${completedCount} completed`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Header;