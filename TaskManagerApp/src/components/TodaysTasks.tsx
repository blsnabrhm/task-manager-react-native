import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { formatLocalDate, getTodayString } from '../utils/dateUtils';

interface TodaysTasksProps {
  tasks: Task[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  pendingDeleteId?: number | null;
}

const TodaysTasks: React.FC<TodaysTasksProps> = ({ tasks, onToggle, onDelete, pendingDeleteId = null }) => {
  const { theme } = useTheme();

  // Get today's date in YYYY-MM-DD format (local timezone)
  const todayStr = getTodayString();

  // Filter tasks for today
  const todaysTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return formatLocalDate(taskDate) === todayStr;
  });

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggle={onToggle}
      onDelete={onDelete}
      isPendingDelete={pendingDeleteId === item.id}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Today's Tasks
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={styles.badgeText}>{todaysTasks.length}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {todaysTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              No tasks for today 📅
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.text.muted }]}>
              Enjoy your free day or add some tasks to stay productive!
            </Text>
          </View>
        ) : (
          <FlatList
            data={todaysTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.tasksList}
            nestedScrollEnabled={true}
            style={styles.flatList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    marginBottom: 16,
    flex: 1,
    minHeight: 250, // Minimum height to show more content
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
    minHeight: 170, // Ensure adequate space to show multiple tasks
  },
  flatList: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  tasksList: {
    paddingBottom: 8,
  },
});

export default TodaysTasks;