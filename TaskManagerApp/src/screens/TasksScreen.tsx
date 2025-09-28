// src/screens/TasksScreen.tsx - Main Tasks Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { 
  TaskItem, 
  LoadingSpinner, 
  Header, 
  AddTaskForm, 
  EmptyState,
  WorkspaceHeader 
} from '../components';
import { Task } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as apiService from '../services/apiService';

const TasksScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

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

  const handleAddTask = async (): Promise<void> => {
    if (!user || !newTaskTitle.trim()) return;
    
    try {
      setIsAddingTask(true);
      const response = await apiService.createTask(newTaskTitle.trim(), user.id);
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
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTask(taskId, user.id);
              setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const completedTasksCount = tasks.filter(task => task.completed).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <WorkspaceHeader />
      
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

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
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
            style={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    padding: 20,
  },
  taskList: {
    flex: 1,
    marginTop: 10,
  },
});

export default TasksScreen;