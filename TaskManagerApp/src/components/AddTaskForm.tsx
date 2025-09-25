// src/components/AddTaskForm.tsx - Add Task Form Component
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AddTaskFormProps {
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  onAddTask: () => void;
  loading: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ 
  newTaskTitle, 
  setNewTaskTitle, 
  onAddTask, 
  loading 
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.addTaskSection, { backgroundColor: theme.background.card }]}>
      <TextInput
        style={[
          styles.textInput, 
          { 
            borderColor: theme.border.light, 
            backgroundColor: theme.background.card, 
            color: theme.text.primary 
          },
          loading && { backgroundColor: theme.background.disabled, color: theme.text.secondary }
        ]}
        placeholder="What needs to be done?"
        placeholderTextColor={theme.text.secondary}
        value={newTaskTitle}
        onChangeText={setNewTaskTitle}
        onSubmitEditing={onAddTask}
        editable={!loading}
        returnKeyType="done"
        maxLength={100}
      />
      <TouchableOpacity
        style={[
          styles.addButton, 
          { backgroundColor: theme.primary },
          (loading || !newTaskTitle.trim()) && { backgroundColor: theme.secondary }
        ]}
        onPress={onAddTask}
        disabled={loading || !newTaskTitle.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.addButtonText}>Add</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addTaskSection: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTaskForm;