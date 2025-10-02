import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface TaskAnalyticsTileProps {
  totalTasks: number;
  completedTasks: number;
}

const TaskAnalyticsTile: React.FC<TaskAnalyticsTileProps> = ({
  totalTasks,
  completedTasks,
}) => {
  const { theme } = useTheme();
  
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const remainingTasks = totalTasks - completedTasks;

  // Create simple progress bar segments
  const progressSegments = [];
  const segmentCount = 10;
  for (let i = 0; i < segmentCount; i++) {
    const isCompleted = (i / segmentCount) < (completionPercentage / 100);
    progressSegments.push(
      <View
        key={i}
        style={[
          styles.progressSegment,
          {
            backgroundColor: isCompleted ? theme.success : theme.border.light,
          }
        ]}
      />
    );
  }

  return (
    <View style={[styles.tile, { backgroundColor: theme.background.card }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>✅</Text>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Tasks Progress
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={[styles.mainStat, { color: theme.primary }]}>
          {totalTasks === 0 ? '—' : `${completedTasks}/${totalTasks}`}
        </Text>
        <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
          {totalTasks === 0 ? 'no tasks yet' : 'tasks completed'}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {progressSegments}
        </View>
        <Text style={[styles.percentage, { color: theme.text.secondary }]}>
          {Math.round(completionPercentage)}%
        </Text>
      </View>

      {remainingTasks > 0 && (
        <Text style={[styles.remaining, { color: theme.warning }]}>
          {remainingTasks} remaining
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    padding: 20,
    margin: 8,
    flex: 1,
    minHeight: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mainStat: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    marginRight: 1,
    borderRadius: 1,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  remaining: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TaskAnalyticsTile;