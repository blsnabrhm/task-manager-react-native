import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types';
import { createLocalDateString, formatLocalDate } from '../utils/dateUtils';

interface CalendarProps {
  tasks: Task[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateSelect, selectedDate }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDatePress = (dateStr: string, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      onDateSelect(dateStr);
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
                      !dateObj.isCurrentMonth && styles.otherMonthCell
                    ]}
                    onPress={() => handleDatePress(dateObj.dateStr, dateObj.isCurrentMonth)}
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
});

export default Calendar;