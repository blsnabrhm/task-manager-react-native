import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  LeftPanel,
  NoteTile,
  LoadingSpinner,
  EmptyState
} from '../components';
import { Note } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAnimation } from '../contexts/AnimationContext';
import * as apiService from '../services/apiService';

interface NotesScreenProps {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
    goBack: () => void;
  };
}

const NotesScreen: React.FC<NotesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { triggerSlideIn } = useAnimation();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<any[]>([]); // For LeftPanel
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  
  // Detect mobile device based on screen width and handle orientation changes
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [leftPanelVisible, setLeftPanelVisible] = useState<boolean>(screenData.width >= 768); // Expanded on tablets/desktop, collapsed on mobile
  
  const screenWidth = screenData.width;
  const isTablet = screenWidth > 768;

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchTasks(); // For LeftPanel
    }
    triggerSlideIn('right');
  }, [user, triggerSlideIn]);

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
      // Auto-adjust panel visibility based on new screen size
      const isNowMobile = window.width < 768;
      setLeftPanelVisible(!isNowMobile);
    });

    return () => subscription?.remove();
  }, []);

  // Refresh notes when screen is focused (simulated)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user && !loading) {
        fetchNotes();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [user, loading]);

  const fetchNotes = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiService.getNotes(user.id);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to fetch notes. Please try again.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await apiService.getTasks(user.id);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const handleNotePress = (note: Note) => {
    if (navigation) {
      navigation.navigate('NoteEditor', {
        note: note,
        mode: 'edit'
      });
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!user) return;

    // Simple two-tap confirmation: first tap marks for deletion, second tap confirms
    if (pendingDeleteId === noteId) {
      // Second tap - actually delete
      try {
        console.log('NotesScreen: Deleting note with id:', noteId, 'userId:', user.id);
        await apiService.deleteNote(noteId, user.id);
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        setPendingDeleteId(null);
        Alert.alert('Success', 'Note deleted successfully!');
      } catch (error) {
        console.error('NotesScreen: Error deleting note:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        Alert.alert('Error', `Failed to delete note: ${errorMessage}`);
        setPendingDeleteId(null);
      }
    } else {
      // First tap - mark for deletion
      setPendingDeleteId(noteId);
      Alert.alert('Confirm Delete', 'Tap delete again to confirm removal', [
        { text: 'No', style: 'cancel', onPress: () => setPendingDeleteId(null) },
        { text: 'Yes', onPress: () => {} } // Empty onPress, user will tap the button again
      ]);
      
      // Auto-cancel after 5 seconds
      setTimeout(() => {
        setPendingDeleteId(null);
      }, 5000);
    }
  };

  const handleAddNote = () => {
    if (navigation) {
      navigation.navigate('NoteEditor', {
        mode: 'create'
      });
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? '' : date);
  };

  const handleToggleTaskComplete = (id: number, completed: boolean) => {
    // Navigate to Task Manager for task operations
    if (navigation) {
      navigation.navigate('TaskManager');
    }
  };

  const handleDeleteTask = (id: number) => {
    // Navigate to Task Manager for task operations
    if (navigation) {
      navigation.navigate('TaskManager');
    }
  };

  const toggleLeftPanel = () => {
    setLeftPanelVisible(!leftPanelVisible);
  };

  // Calculate grid layout
  const rightContentWidth = leftPanelVisible ? screenWidth - 280 : screenWidth - 60;
  const padding = 16;
  const availableWidth = rightContentWidth - (padding * 2);
  const minTileWidth = 280;
  const maxColumns = Math.floor(availableWidth / minTileWidth);
  const columns = Math.max(1, Math.min(3, maxColumns)); // Between 1-3 columns
  const tileWidth = (availableWidth - (12 * (columns - 1))) / columns; // 12px gap between tiles

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Back Navigation Header */}
      {navigation && (
        <View style={[styles.navigationHeader, { 
          backgroundColor: theme.background.card, 
          borderBottomColor: theme.border.light 
        }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: theme.primary }]}>
              ‹ Back to Workspace
            </Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: theme.text.primary }]}>
            Notes
          </Text>
        </View>
      )}
      
      <View style={styles.mainContainer}>
        {/* Left Panel */}
        <LeftPanel 
          isCollapsed={!leftPanelVisible}
          onToggle={toggleLeftPanel}
          tasks={tasks}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onToggleTask={handleToggleTaskComplete}
          onDeleteTask={handleDeleteTask}
          calendarContext="notes"
        />

        {/* Right Content Area */}
        <View style={[
          styles.rightContent, 
          { marginLeft: leftPanelVisible ? 280 : 80 }
        ]}>
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.contentInner}>
              {/* Header with Add Button */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: theme.text.primary }]}>
                    Your Notes
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddNote}
                >
                  <Ionicons name="add" size={24} color={theme.white} />
                </TouchableOpacity>
              </View>

              {/* Notes Grid */}
              {notes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <EmptyState />
                  <Text style={[styles.emptyText, { color: theme.text.muted }]}>
                    Start capturing your thoughts and ideas
                  </Text>
                </View>
              ) : (
                <View style={[styles.notesGrid, { gap: 12 }]}>
                  <View style={styles.notesRow}>
                    {notes.map((note, index) => (
                      <View
                        key={note.id}
                        style={[
                          styles.noteColumn,
                          { width: tileWidth }
                        ]}
                      >
                        <NoteTile
                          note={note}
                          onPress={handleNotePress}
                          onDelete={handleDeleteNote}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  rightContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  notesGrid: {
    flex: 1,
  },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  noteColumn: {
    // Width will be set dynamically
  },
});

export default NotesScreen;