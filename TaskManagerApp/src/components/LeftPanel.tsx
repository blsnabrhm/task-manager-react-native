import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types';
import Calendar from './Calendar';
import TodaysTasks from './TodaysTasks';

interface LeftPanelProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  tasks?: Task[];
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  onToggleTask?: (id: number, completed: boolean) => void;
  onDeleteTask?: (id: number) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ 
  isCollapsed = false, 
  onToggle,
  tasks = [],
  onDateSelect = () => {},
  selectedDate = '',
  onToggleTask = () => {},
  onDeleteTask = () => {}
}) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.leftPanel, 
      { 
        backgroundColor: theme.background.card,
        borderRightColor: theme.border.light,
        width: isCollapsed ? 80 : 280,
      }
    ]}>
      {!isCollapsed && (
        <View style={styles.contentContainer}>
          {/* Calendar Section */}
          <View style={[styles.calendarSection, { borderBottomColor: theme.border.light }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Calendar
            </Text>
            <Calendar 
              tasks={tasks}
              onDateSelect={onDateSelect}
              selectedDate={selectedDate}
            />
          </View>

          {/* Today's Tasks Section */}
          <View style={styles.tasksSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Today's Tasks
            </Text>
            <TodaysTasks 
              tasks={tasks}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          </View>
        </View>
      )}

      {/* Hamburger Menu at Bottom - Always visible */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.hamburgerButton, { backgroundColor: theme.primary }]}
          onPress={onToggle}
        >
          <Ionicons 
            name={isCollapsed ? "menu" : "menu-outline"} 
            size={24} 
            color={theme.white} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leftPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    zIndex: 1000,
    paddingTop: 10, // Account for header height
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingBottom: 80, // Space for hamburger button at bottom
  },
  calendarSection: {
    height: 400, // Increased height to accommodate full calendar without scrolling
    padding: 16,
    borderBottomWidth: 1,
  },
  tasksSection: {
    flex: 1, // Takes remaining space
    padding: 16,
    minHeight: 200, // Reduced minimum height since calendar got more space
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    alignItems: 'flex-start',
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default LeftPanel;