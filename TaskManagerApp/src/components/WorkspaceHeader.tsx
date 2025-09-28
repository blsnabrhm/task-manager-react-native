// src/components/WorkspaceHeader.tsx - Workspace Header with Theme Toggle
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const WorkspaceHeader: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.primary}
      />
      <View style={[styles.header, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.light }]}>
        <View style={styles.leftSection}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {user?.name ? `${user.name}'s Workspace` : 'My Workspace'}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: theme.background.card }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={[styles.themeIcon, { color: theme.text.primary }]}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
            <Text style={[styles.themeText, { color: theme.text.secondary }]}>
              {isDarkMode ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.danger }]}
            onPress={logout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  themeIcon: {
    fontSize: 16,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WorkspaceHeader;