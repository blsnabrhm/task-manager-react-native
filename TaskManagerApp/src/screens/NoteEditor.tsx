import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Note } from '../types';
import * as apiService from '../services/apiService';

interface NoteEditorProps {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      note?: Note;
      mode: 'create' | 'edit';
    };
  };
}

const NoteEditor: React.FC<NoteEditorProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const existingNote = route?.params?.note;
  const mode = route?.params?.mode || 'create';
  const isEditing = mode === 'edit' && existingNote;

  const [title, setTitle] = useState<string>(existingNote?.title || '');
  const [body, setBody] = useState<string>(existingNote?.body || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    // Check if there are unsaved changes
    const originalTitle = existingNote?.title || '';
    const originalBody = existingNote?.body || '';
    setHasChanges(title !== originalTitle || body !== originalBody);
  }, [title, body, existingNote]);

  const handleSave = async () => {
    if (!user) return;

    // Validate input
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your note.');
      return;
    }

    if (!body.trim()) {
      Alert.alert('Missing Content', 'Please enter some content for your note.');
      return;
    }

    try {
      setSaving(true);

      if (isEditing && existingNote) {
        // Update existing note
        await apiService.updateNote(existingNote.id, {
          title: title.trim(),
          body: body.trim(),
        }, user.id);
      } else {
        // Create new note
        await apiService.createNote(title.trim(), body.trim(), user.id);
      }

      Alert.alert(
        'Success',
        `Note ${isEditing ? 'updated' : 'created'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'create'} note. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before leaving?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              if (navigation) {
                navigation.goBack();
              }
            },
          },
          {
            text: 'Save',
            onPress: handleSave,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      if (navigation) {
        navigation.goBack();
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.background.card,
        borderBottomColor: theme.border.light 
      }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {isEditing ? 'Edit Note' : 'New Note'}
          </Text>
          {isEditing && existingNote && (
            <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
              Last modified: {formatDate(existingNote.updatedAt)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { 
              backgroundColor: hasChanges ? theme.primary : theme.text.muted,
              opacity: saving ? 0.6 : 1 
            }
          ]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <Text style={[styles.saveButtonText, { color: theme.white }]}>
              Saving...
            </Text>
          ) : (
            <>
              <Ionicons 
                name="checkmark" 
                size={16} 
                color={theme.white} 
                style={styles.saveIcon} 
              />
              <Text style={[styles.saveButtonText, { color: theme.white }]}>
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>
              Title
            </Text>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.light,
                  backgroundColor: theme.background.card,
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter note title..."
              placeholderTextColor={theme.text.muted}
              multiline={false}
              maxLength={100}
            />
          </View>

          {/* Body Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>
              Content
            </Text>
            <TextInput
              style={[
                styles.bodyInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.light,
                  backgroundColor: theme.background.card,
                }
              ]}
              value={body}
              onChangeText={setBody}
              placeholder="Start writing your note..."
              placeholderTextColor={theme.text.muted}
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          {/* Character Count */}
          <View style={styles.metaInfo}>
            <Text style={[styles.characterCount, { color: theme.text.muted }]}>
              Title: {title.length}/100 characters
            </Text>
            <Text style={[styles.characterCount, { color: theme.text.muted }]}>
              Content: {body.length} characters
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveIcon: {
    marginRight: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    minHeight: 48,
  },
  bodyInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 400,
  },
  metaInfo: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  characterCount: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default NoteEditor;