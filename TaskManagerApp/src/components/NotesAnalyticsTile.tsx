import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatLocalDate, getTodayString } from '../utils/dateUtils';

interface NotesAnalyticsTileProps {
  totalNotes: number;
  notes: Array<{
    id: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const NotesAnalyticsTile: React.FC<NotesAnalyticsTileProps> = ({
  totalNotes,
  notes,
}) => {
  const { theme } = useTheme();
  
  const todayStr = getTodayString();
  
  // Count notes created today
  const notesToday = notes.filter(note => {
    const noteDate = new Date(note.createdAt);
    return formatLocalDate(noteDate) === todayStr;
  }).length;
  
  // Count notes updated today (but not created today)
  const notesUpdatedToday = notes.filter(note => {
    const createdDate = new Date(note.createdAt);
    const updatedDate = new Date(note.updatedAt);
    const createdToday = formatLocalDate(createdDate) === todayStr;
    const updatedToday = formatLocalDate(updatedDate) === todayStr;
    return updatedToday && !createdToday;
  }).length;

  // Create activity visualization (simple bars)
  const activityBars = [];
  const maxBars = 7;
  const maxActivity = Math.max(3, notesToday + notesUpdatedToday); // Minimum scale of 3
  
  for (let i = 0; i < maxBars; i++) {
    let height = 4; // Base height
    if (i < notesToday) {
      height = 16 + (notesToday * 4); // Created notes (taller bars)
    } else if (i < notesToday + notesUpdatedToday) {
      height = 8 + (notesUpdatedToday * 3); // Updated notes (medium bars)
    }
    
    const isActive = i < (notesToday + notesUpdatedToday);
    
    activityBars.push(
      <View
        key={i}
        style={[
          styles.activityBar,
          {
            height: Math.min(height, 24), // Max height cap
            backgroundColor: isActive ? theme.primary : theme.border.light,
          }
        ]}
      />
    );
  }

  return (
    <View style={[styles.tile, { backgroundColor: theme.background.card }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>📝</Text>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Notes Activity
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={[styles.mainStat, { color: theme.primary }]}>
          {notesToday}
        </Text>
        <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
          {notesToday === 1 ? 'note created today' : 'notes created today'}
        </Text>
      </View>

      <View style={styles.activityContainer}>
        <View style={styles.activityChart}>
          {activityBars}
        </View>
        <Text style={[styles.totalNotes, { color: theme.text.secondary }]}>
          {totalNotes} total
        </Text>
      </View>

      {notesUpdatedToday > 0 && (
        <Text style={[styles.updated, { color: theme.info }]}>
          {notesUpdatedToday} updated today
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
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    height: 24,
    marginRight: 8,
  },
  activityBar: {
    width: 6,
    marginRight: 2,
    borderRadius: 1,
    alignSelf: 'flex-end',
  },
  totalNotes: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  updated: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default NotesAnalyticsTile;