import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { 
  WorkspaceHeader, 
  LoadingSpinner,
  LeftPanel,
  AppTile,
  TaskAnalyticsTile,
  NotesAnalyticsTile
} from '../components';
import { Task, Note, WorkspaceApp, DashboardSection } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAnimation } from '../contexts/AnimationContext';
import * as apiService from '../services/apiService';

interface DashboardScreenProps {
  navigation: {
    navigate: (screenName: string, params?: any) => void;
    goBack: () => void;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { triggerFadeIn } = useAnimation();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  
  // Detect mobile device based on screen width and handle orientation changes
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [leftPanelVisible, setLeftPanelVisible] = useState<boolean>(screenData.width >= 768); // Expanded on tablets/desktop, collapsed on mobile


  // Define available workspace apps
  const workspaceApps: WorkspaceApp[] = [
    {
      id: 'task-manager',
      title: 'Task Manager',
      description: 'Organize your tasks with due dates and priorities',
      icon: '✅',
      color: '#007AFF',
      route: 'TaskManager',
      isEnabled: true,
      category: 'productivity',
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Quick notes and ideas for your workspace',
      icon: '📝',
      color: '#FF9500',
      route: 'Notes',
      isEnabled: true,
      category: 'productivity',
    },
    {
      id: 'calendar-planner',
      title: 'Calendar Planner',
      description: 'Advanced calendar with scheduling features',
      icon: '📅',
      color: '#34C759',
      route: 'CalendarPlanner',
      isEnabled: false,
      category: 'productivity',
    },
    {
      id: 'team-chat',
      title: 'Team Chat',
      description: 'Communicate with your team members',
      icon: '💬',
      color: '#5856D6',
      route: 'TeamChat',
      isEnabled: false,
      category: 'communication',
    },
    {
      id: 'file-manager',
      title: 'File Manager',
      description: 'Organize and share your workspace files',
      icon: '📁',
      color: '#AF52DE',
      route: 'FileManager',
      isEnabled: false,
      category: 'utility',
    },
    {
      id: 'time-tracker',
      title: 'Time Tracker',
      description: 'Track time spent on different projects',
      icon: '⏱️',
      color: '#FF3B30',
      route: 'TimeTracker',
      isEnabled: false,
      category: 'productivity',
    },
  ];

  // Group apps by category
  const dashboardSections: DashboardSection[] = [
    {
      id: 'productivity',
      title: 'Productivity',
      apps: workspaceApps.filter(app => app.category === 'productivity'),
    },
    {
      id: 'communication',
      title: 'Communication',
      apps: workspaceApps.filter(app => app.category === 'communication'),
    },
    {
      id: 'utility',
      title: 'Utilities',
      apps: workspaceApps.filter(app => app.category === 'utility'),
    },
  ];

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchNotes();
    }
    triggerFadeIn();
  }, [user, triggerFadeIn]);

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
      // Auto-adjust panel visibility based on new screen size
      const isNowMobile = window.width < 768;
      setLeftPanelVisible(!isNowMobile);
    });

    return () => subscription?.remove();
  }, []);

  const fetchTasks = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiService.getTasks(user.id);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await apiService.getNotes(user.id);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Don't show alert for notes fetch error as it's secondary data
    }
  };

  const handleAppPress = (route: string) => {
    navigation.navigate(route);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? '' : date);
  };

  const handleToggleTaskComplete = async (id: number, completed: boolean) => {
    if (!user) return;

    try {
      await apiService.updateTask(id, { completed }, user.id);
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!user) return;

    // Simple two-tap confirmation: first tap marks for deletion, second tap confirms
    if (pendingDeleteId === id) {
      // Second tap - actually delete
      try {
        console.log('Deleting task with id:', id, 'userId:', user.id);
        await apiService.deleteTask(id, user.id);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        setPendingDeleteId(null);
        Alert.alert('Success', 'Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        Alert.alert('Error', `Failed to delete task: ${errorMessage}`);
        setPendingDeleteId(null);
      }
    } else {
      // First tap - mark for deletion
      setPendingDeleteId(id);
      Alert.alert('Confirm Delete', 'Tap delete again to confirm removal', [
        { text: 'No', style: 'cancel', onPress: () => setPendingDeleteId(null) },
        { text: 'Yes', onPress: () => {} } // Empty onPress, user will tap the button again
      ]);
      
      // Auto-cancel after 5 seconds
      setTimeout(() => {
        setPendingDeleteId(null);
      }, 5000);
    }
  };

  const toggleLeftPanel = () => {
    setLeftPanelVisible(!leftPanelVisible);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <WorkspaceHeader />
      
      <View style={styles.mainContainer}>
        {/* Left Panel */}
        <LeftPanel 
          isCollapsed={!leftPanelVisible}
          onToggle={toggleLeftPanel}
          tasks={tasks}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onToggleTask={handleToggleTaskComplete}
          onDeleteTask={handleDeleteTask}
          pendingDeleteId={pendingDeleteId}
          calendarContext="dashboard"
        />

        {/* Right Content Area - Scrollable */}
        <View style={[
          styles.rightContent, 
          { marginLeft: leftPanelVisible ? 280 : 80 }
        ]}>
          <ScrollView style={styles.rightScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.rightContentInner}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Your Workspace
              </Text>
              
              {/* Analytics Section */}
              <View style={styles.analyticsSection}>
                <Text style={[styles.analyticsSectionTitle, { color: theme.text.secondary }]}>
                  Today's Overview
                </Text>
                <View style={styles.analyticsRow}>
                  <TaskAnalyticsTile 
                    totalTasks={tasks.length}
                    completedTasks={tasks.filter(task => task.completed).length}
                  />
                  <NotesAnalyticsTile 
                    totalNotes={notes.length}
                    notes={notes}
                  />
                </View>
              </View>
              
              {dashboardSections.map((section) => (
                <View key={section.id} style={styles.section}>
                  <Text style={[styles.categoryTitle, { color: theme.text.secondary }]}>
                    {section.title}
                  </Text>
                  
                  {section.apps.map((app) => (
                    <AppTile
                      key={app.id}
                      app={app}
                      onPress={handleAppPress}
                    />
                  ))}
                </View>
              ))}
              
              {/* Coming Soon Section */}
              <View style={styles.comingSoonSection}>
                <Text style={[styles.comingSoonTitle, { color: theme.text.muted }]}>
                  More apps coming soon! 🚀
                </Text>
                <Text style={[styles.comingSoonDescription, { color: theme.text.muted }]}>
                  We're working on exciting new features for your workspace
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  hamburgerButton: {
    padding: 12,
    marginRight: 8,
  },
  hamburgerIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  rightContent: {
    flex: 1,
  },
  rightScrollContent: {
    flex: 1,
  },
  rightContentInner: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingLeft: 4,
  },
  comingSoonSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Legacy styles for backward compatibility
  content: {
    flex: 1,
    padding: 16,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  tabletLayout: {
    flexDirection: 'row',
  },
  leftSection: {
    marginBottom: 24,
  },
  tabletLeftSection: {
    width: 350,
    marginRight: 24,
    marginBottom: 0,
  },
  rightSection: {
    flex: 1,
  },
  tabletRightSection: {
    flex: 1,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analyticsRow: {
    flexDirection: 'row',
    marginHorizontal: -8, // Offset the margin from tiles
  },
});

export default DashboardScreen;