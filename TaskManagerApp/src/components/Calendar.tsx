import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types';
import { createLocalDateString, formatLocalDate } from '../utils/dateUtils';

interface CalendarProps {
  tasks: Task[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  showPopup?: boolean; // Controls whether to show popup or just call onDateSelect
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateSelect, selectedDate, showPopup = true }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [popupDate, setPopupDate] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get previous month's last few days to fill the calendar grid
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create array of dates to display
  const calendarDates: {
    date: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  // Previous month dates
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i;
    const dateStr = createLocalDateString(year, month - 1, date);
    calendarDates.push({
      date: date,
      dateStr: dateStr,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month dates
  for (let date = 1; date <= daysInMonth; date++) {
    const dateStr = createLocalDateString(year, month, date);
    const isToday = 
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === date;
    
    calendarDates.push({
      date: date,
      dateStr: dateStr,
      isCurrentMonth: true,
      isToday: isToday,
    });
  }

  // Next month dates to fill remaining spots
  const remainingSpots = 42 - calendarDates.length; // 6 rows * 7 days
  for (let date = 1; date <= remainingSpots; date++) {
    const dateStr = createLocalDateString(year, month + 1, date);
    calendarDates.push({
      date: date,
      dateStr: dateStr,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Check if a date has tasks (using local timezone comparison)
  const hasTasksOnDate = (dateStr: string): boolean => {
    return tasks.some(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return formatLocalDate(taskDate) === dateStr;
    });
  };

  // Get tasks for a specific date
  const getTasksForDate = (dateStr: string): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return formatLocalDate(taskDate) === dateStr;
    });
  };

  // Get task count for tooltip
  const getTaskCountText = (dateStr: string): string => {
    const tasksForDate = getTasksForDate(dateStr);
    const count = tasksForDate.length;
    if (count === 0) return '';
    if (count === 1) return '1 task';
    return `${count} tasks`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDatePress = (dateStr: string, isCurrentMonth: boolean, weekIndex: number, dayIndex: number) => {
    if (isCurrentMonth && hasTasksOnDate(dateStr) && showPopup) {
      // Show popup only if showPopup prop is true (Dashboard mode)
      // Calculate position based on grid layout
      const cellWidth = 32; // Width of each date cell
      const cellSpacing = 8; // Space between cells
      const calendarPadding = 16; // Calendar container padding
      const headerHeight = 100; // Header + week days height
      const popupWidth = 250;
      
      // Calculate initial position
      let x = calendarPadding + (dayIndex * (cellWidth + cellSpacing)) + (cellWidth / 2);
      const y = headerHeight + (weekIndex * (cellWidth + cellSpacing)) - 10;
      
      // Adjust x position to keep popup on screen (assuming calendar width ~280px)
      const calendarWidth = 280;
      if (x - (popupWidth / 2) < 0) {
        x = popupWidth / 2; // Keep left edge on screen
      } else if (x + (popupWidth / 2) > calendarWidth) {
        x = calendarWidth - (popupWidth / 2); // Keep right edge on screen
      }
      
      setPopupPosition({ x, y });
      setPopupDate(popupDate === dateStr ? null : dateStr);
    } else if (isCurrentMonth) {
      // Regular date selection - call onDateSelect for all valid dates
      // In TasksScreen mode (showPopup=false), this will filter tasks
      // In Dashboard mode (showPopup=true), this handles dates without tasks
      onDateSelect(dateStr);
    }
  };

  const handleDateLongPress = (dateStr: string, isCurrentMonth: boolean) => {
    if (isCurrentMonth && hasTasksOnDate(dateStr)) {
      setHoveredDate(hoveredDate === dateStr ? null : dateStr);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')}
          style={[styles.navButton, { backgroundColor: theme.background.primary }]}
        >
          <Text style={[styles.navButtonText, { color: theme.text.primary }]}>‹</Text>
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.text.primary }]}>
          {monthNames[month]} {year}
        </Text>
        
        <TouchableOpacity 
          onPress={() => navigateMonth('next')}
          style={[styles.navButton, { backgroundColor: theme.background.primary }]}
        >
          <Text style={[styles.navButtonText, { color: theme.text.primary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <Text key={day} style={[styles.weekDay, { color: theme.text.secondary }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendar}>
          {Array.from({ length: Math.ceil(calendarDates.length / 7) }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {calendarDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dateObj, dayIndex) => {
                const isSelected = selectedDate === dateObj.dateStr;
                const hasTasks = hasTasksOnDate(dateObj.dateStr);
                
                return (
                  <TouchableOpacity
                    key={`${weekIndex}-${dayIndex}`}
                    style={[
                      styles.dateCell,
                      dateObj.isToday && styles.todayCell,
                      isSelected && { backgroundColor: theme.primary },
                      !dateObj.isCurrentMonth && styles.otherMonthCell,
                      hoveredDate === dateObj.dateStr && { backgroundColor: theme.background.disabled }
                    ]}
                    onPress={() => handleDatePress(dateObj.dateStr, dateObj.isCurrentMonth, weekIndex, dayIndex)}
                    onLongPress={() => handleDateLongPress(dateObj.dateStr, dateObj.isCurrentMonth)}
                    disabled={!dateObj.isCurrentMonth}
                  >
                    <Text 
                      style={[
                        styles.dateText,
                        { color: dateObj.isCurrentMonth ? theme.text.primary : theme.text.muted },
                        dateObj.isToday && { color: theme.primary },
                        isSelected && { color: '#fff' }
                      ]}
                    >
                      {dateObj.date}
                    </Text>
                    {hasTasks && (
                      <View style={[styles.taskDot, { backgroundColor: isSelected ? '#fff' : theme.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Tooltip for hovered date */}
      {hoveredDate && (
        <View style={[styles.tooltip, { backgroundColor: theme.background.card, borderColor: theme.border.light }]}>
          <Text style={[styles.tooltipText, { color: theme.text.primary }]}>
            {getTaskCountText(hoveredDate)}
          </Text>
        </View>
      )}

      {/* Popup for clicked date */}
      {popupDate && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPopupDate(null)}
        >
          <TouchableWithoutFeedback onPress={() => setPopupDate(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[
                  styles.popup, 
                  { 
                    backgroundColor: theme.background.card, 
                    borderColor: theme.border.light,
                    position: 'absolute',
                    left: popupPosition.x - 125, // Center the popup (250px width / 2)
                    top: popupPosition.y
                  }
                ]}>
                  <View style={styles.popupArrow} />
                  <Text style={[styles.popupTitle, { color: theme.text.primary }]}>
                    Tasks for {new Date(popupDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                  <ScrollView style={styles.popupContent}>
                    {getTasksForDate(popupDate).map((task, index) => (
                      <View key={task.id} style={[styles.taskItem, { borderBottomColor: theme.border.light }]}>
                        <View style={[
                          styles.taskStatus,
                          { backgroundColor: task.completed ? theme.success : theme.warning || '#FF9500' }
                        ]} />
                        <Text style={[
                          styles.taskTitle,
                          { 
                            color: theme.text.primary,
                            textDecorationLine: task.completed ? 'line-through' : 'none'
                          }
                        ]}>
                          {task.title}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    maxHeight: 330, // Increased to utilize the larger calendar section space
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDay: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  calendar: {
    flex: 1,
  },
  dateCell: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tooltip: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 1000,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
    width: 250,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 8, // Space for arrow
  },
  popupArrow: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  popupContent: {
    maxHeight: 200,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  taskStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Calendar;