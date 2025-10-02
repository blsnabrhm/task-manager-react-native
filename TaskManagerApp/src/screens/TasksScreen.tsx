// src/screens/TasksScreen.tsx - Main Tasks Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  FlatList, 
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { 
  TaskItem, 
  LoadingSpinner, 
  Header, 
  AddTaskForm, 
  EmptyState,
  LeftPanel
} from '../components';
import { Task } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAnimation } from '../contexts/AnimationContext';
import * as apiService from '../services/apiService';
import { formatLocalDate } from '../utils/dateUtils';

interface TasksScreenProps {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
    goBack: () => void;
  };
}

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { triggerSlideIn } = useAnimation();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  
  // Detect mobile device based on screen width and handle orientation changes
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [leftPanelVisible, setLeftPanelVisible] = useState<boolean>(screenData.width >= 768); // Expanded on tablets/desktop, collapsed on mobile

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
    triggerSlideIn('right');
  }, [user, triggerSlideIn]);

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

  useEffect(() => {
    // Filter tasks based on selected date (using local timezone comparison)
    if (selectedDate) {
      const filtered = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return formatLocalDate(taskDate) === selectedDate;
      });
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [tasks, selectedDate]);

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

  const handleAddTask = async (dueDate?: string): Promise<void> => {
    if (!user || !newTaskTitle.trim()) return;
    
    try {
      setIsAddingTask(true);
      const response = await apiService.createTask(newTaskTitle.trim(), user.id, dueDate);
      setTasks(prevTasks => [...prevTasks, response.data]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: number): Promise<void> => {
    if (!user) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await apiService.updateTask(
        taskId, 
        { completed: !task.completed }, 
        user.id
      );
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? response.data : t)
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: number): Promise<void> => {
    if (!user) return;
    
    // Simple two-tap confirmation: first tap marks for deletion, second tap confirms
    if (pendingDeleteId === taskId) {
      // Second tap - actually delete
      try {
        console.log('TasksScreen: Deleting task with id:', taskId, 'userId:', user.id);
        await apiService.deleteTask(taskId, user.id);
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        setPendingDeleteId(null);
        Alert.alert('Success', 'Task deleted successfully!');
      } catch (error) {
        console.error('TasksScreen: Error deleting task:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        Alert.alert('Error', `Failed to delete task: ${errorMessage}`);
        setPendingDeleteId(null);
      }
    } else {
      // First tap - mark for deletion
      setPendingDeleteId(taskId);
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

  const completedTasksCount = tasks.filter(task => task.completed).length;

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? '' : date); // Toggle selection
  };

  const handleToggleTaskComplete = (id: number, completed: boolean) => {
    handleToggleTask(id);
  };

  const toggleLeftPanel = () => {
    setLeftPanelVisible(!leftPanelVisible);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Back Navigation Header */}
      {navigation && (
        <View style={[styles.navigationHeader, { backgroundColor: theme.background.card, borderBottomColor: theme.border.light }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: theme.primary }]}>‹ Back to Workspace</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: theme.text.primary }]}>Task Manager</Text>
        </View>
      )}
      
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
          calendarContext="tasks"
        />

        {/* Right Content Area */}
        <View style={[
          styles.rightContent, 
          { marginLeft: leftPanelVisible ? 280 : 80 }
        ]}>
          <View style={styles.content}>
            <Header 
              tasksCount={tasks.length} 
              completedCount={completedTasksCount} 
            />
            
            <AddTaskForm
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              onAddTask={handleAddTask}
              loading={isAddingTask}
            />

            {/* All Tasks or Filtered Tasks */}
            {filteredTasks.length === 0 && !selectedDate ? (
              <EmptyState />
            ) : (
              <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
                {selectedDate && (
                  <View style={[styles.selectedDateHeader, { backgroundColor: theme.background.card }]}>
                    <Text style={[styles.selectedDateTitle, { color: theme.text.primary }]}>
                      Tasks for {new Date(selectedDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: new Date(selectedDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                      })}
                    </Text>
                    <Text style={[styles.selectedDateSubtitle, { color: theme.text.secondary }]}>
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                      {filteredTasks.filter(t => t.completed).length > 0 && 
                        ` • ${filteredTasks.filter(t => t.completed).length} completed`}
                    </Text>
                  </View>
                )}
                
                {filteredTasks.map((item) => (
                  <TaskItem
                    key={item.id.toString()}
                    task={item}
                    onToggle={handleToggleTaskComplete}
                    onDelete={handleDeleteTask}
                    isPendingDelete={pendingDeleteId === item.id}
                  />
                ))}
                
                {selectedDate && filteredTasks.length === 0 && (
                  <EmptyState />
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  calendarSection: {
    minHeight: 300,
  },
  tabletCalendar: {
    width: 350,
    marginRight: 16,
  },
  tasksSection: {
    flex: 1,
  },
  tabletTasks: {
    flex: 1,
  },
  tasksList: {
    flex: 1,
  },
  taskList: {
    flex: 1,
    marginTop: 10,
  },
  selectedDateHeader: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDateSubtitle: {
    fontSize: 14,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  rightContent: {
    flex: 1,
  },
});

export default TasksScreen;