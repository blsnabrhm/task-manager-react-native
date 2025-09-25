// src/screens/TasksScreen.tsx - Main Tasks Screen
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Task } from '../types';
import { apiService } from '../services/apiService';
import { useTheme } from '../contexts/ThemeContext';
import { 
  TaskItem, 
  LoadingSpinner, 
  Header, 
  AddTaskForm, 
  EmptyState,
  WorkspaceHeader
} from '../components';

const TasksScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      const fetchedTasks = await apiService.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks. Please check your internet connection.');
      console.error('Load tasks error:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleAddTask = async (): Promise<void> => {
    const title = newTaskTitle.trim();
    if (!title) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      setLoading(true);
      const newTask = await apiService.createTask(title);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setNewTaskTitle('');
      // Optional success feedback
      // Alert.alert('Success', 'Task added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add task. Please try again.');
      console.error('Add task error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, completed: boolean): Promise<void> => {
    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      )
    );

    try {
      await apiService.updateTask(taskId, { completed });
    } catch (error) {
      // Revert on error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !completed } : task
        )
      );
      Alert.alert('Error', 'Failed to update task. Please try again.');
      console.error('Toggle task error:', error);
    }
  };

  const handleDeleteTask = (taskId: number): void => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

            try {
              await apiService.deleteTask(taskId);
            } catch (error) {
              // Revert on error
              setTasks(prevTasks => [...prevTasks, task]);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
              console.error('Delete task error:', error);
            }
          },
        },
      ]
    );
  };

  const completedCount = tasks.filter(task => task.completed).length;

  if (initialLoading) {
    return <LoadingSpinner message="Loading your tasks..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.header.background} 
      />
      
      <WorkspaceHeader isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      <Header tasksCount={tasks.length} completedCount={completedCount} />

      <AddTaskForm
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        onAddTask={handleAddTask}
        loading={loading}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
        )}
        style={styles.tasksList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        refreshing={loading && tasks.length > 0}
        onRefresh={loadTasks}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default TasksScreen;