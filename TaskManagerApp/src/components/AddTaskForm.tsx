// src/components/AddTaskForm.tsx - Add Task Form Component
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Modal, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';

interface AddTaskFormProps {
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  onAddTask: (dueDate?: string) => void;
  loading: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ 
  newTaskTitle, 
  setNewTaskTitle, 
  onAddTask, 
  loading 
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const dueDateString = selectedDate ? selectedDate.toISOString() : undefined;
      onAddTask(dueDateString);
      setSelectedDate(null); // Reset date after adding task
    }
  };

  const handleDateSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowNativePicker(false);
    setShowDatePicker(false);
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const showNativeDatePicker = () => {
    setShowDatePicker(false);
    setShowNativePicker(true);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  return (
    <View style={[styles.addTaskSection, { backgroundColor: theme.background.card }]}>
      <View style={styles.inputContainer}>
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
          onSubmitEditing={handleAddTask}
          editable={!loading}
          returnKeyType="done"
          maxLength={100}
        />
        
        {/* Date Selection Row */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: theme.border.light }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text.secondary }]}>
              📅 {selectedDate ? formatDate(selectedDate) : 'Set due date'}
            </Text>
          </TouchableOpacity>
          
          {selectedDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={clearDate}
            >
              <Text style={[styles.clearDateText, { color: theme.text.muted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addButton, 
          { backgroundColor: theme.primary },
          (loading || !newTaskTitle.trim()) && { backgroundColor: theme.secondary }
        ]}
        onPress={handleAddTask}
        disabled={loading || !newTaskTitle.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.addButtonText}>Add</Text>
        )}
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.datePickerModal, { backgroundColor: theme.background.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Select Due Date
            </Text>
            
            {/* Quick Options */}
            <TouchableOpacity
              style={[styles.dateOption, { borderColor: theme.border.light }]}
              onPress={() => handleDateSelect(0)}
            >
              <Text style={[styles.dateOptionText, { color: theme.text.primary }]}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dateOption, { borderColor: theme.border.light }]}
              onPress={() => handleDateSelect(1)}
            >
              <Text style={[styles.dateOptionText, { color: theme.text.primary }]}>Tomorrow</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dateOption, { borderColor: theme.border.light }]}
              onPress={() => handleDateSelect(7)}
            >
              <Text style={[styles.dateOptionText, { color: theme.text.primary }]}>Next Week</Text>
            </TouchableOpacity>
            
            {/* Custom Date Option */}
            <TouchableOpacity
              style={[styles.dateOption, { borderColor: theme.border.light, backgroundColor: theme.primary + '10' }]}
              onPress={showNativeDatePicker}
            >
              <Text style={[styles.dateOptionText, { color: theme.primary }]}>📅 Choose Custom Date</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.text.muted }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Native Date Picker */}
      {showNativePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}
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
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  textInput: {
    height: 52,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  dateButtonText: {
    fontSize: 14,
  },
  clearDateButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearDateText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dateOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AddTaskForm;