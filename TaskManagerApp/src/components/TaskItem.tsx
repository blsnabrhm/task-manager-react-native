// src/components/TaskItem.tsx - Task Item Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskItemProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, isPendingDelete = false }) => {
  const { theme } = useTheme();

  const formatDueDate = (dueDate: string): string => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateString = date.toDateString();
    const todayString = today.toDateString();
    const tomorrowString = tomorrow.toDateString();
    
    if (dateString === todayString) {
      return 'Due Today';
    } else if (dateString === tomorrowString) {
      return 'Due Tomorrow';
    } else if (date < today) {
      return 'Overdue';
    } else {
      return `Due ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })}`;
    }
  };
  
  return (
    <View style={[styles.taskItem, { backgroundColor: theme.background.card }]}>
      <TouchableOpacity 
        style={styles.taskContent}
        onPress={() => onToggle(task.id, !task.completed)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox, 
          { borderColor: theme.border.checkbox },
          task.completed && { backgroundColor: theme.success, borderColor: theme.success }
        ]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.taskTextContainer}>
          <Text style={[
            styles.taskTitle,
            { color: theme.text.primary },
            task.completed && { textDecorationLine: 'line-through', color: theme.text.secondary }
          ]} numberOfLines={2}>
            {task.title}
          </Text>
          {task.dueDate && (
            <Text style={[
              styles.dueDate,
              { color: theme.text.muted },
              task.completed && { textDecorationLine: 'line-through' }
            ]}>
              📅 {formatDueDate(task.dueDate)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.deleteButton, 
          { 
            backgroundColor: isPendingDelete ? theme.warning || '#FF9500' : theme.danger,
            opacity: isPendingDelete ? 1 : 0.8
          }
        ]}
        onPress={() => onDelete(task.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.deleteButtonText, isPendingDelete && { fontSize: 14 }]}>
          {isPendingDelete ? '✓' : '✕'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskItem;