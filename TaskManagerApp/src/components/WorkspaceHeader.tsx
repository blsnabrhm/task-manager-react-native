// src/components/WorkspaceHeader.tsx - Workspace Header with Theme Toggle
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme, darkTheme } from '../styles/colors';

interface WorkspaceHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <View style={[styles.header, { backgroundColor: theme.header.background, borderBottomColor: theme.header.border }]}>
      <Text style={[styles.headerTitle, { color: theme.header.text }]}>My Workspace</Text>
      
      <TouchableOpacity 
        style={[styles.themeToggle, { backgroundColor: theme.background.card, borderColor: theme.border.light }]}
        onPress={onToggleTheme}
        activeOpacity={0.7}
      >
        <Text style={[styles.themeIcon, { color: theme.text.primary }]}>
          {isDarkMode ? '☀️' : '🌙'}
        </Text>
        <Text style={[styles.themeText, { color: theme.text.secondary }]}>
          {isDarkMode ? 'Light' : 'Dark'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 15, // Account for status bar
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WorkspaceHeader;