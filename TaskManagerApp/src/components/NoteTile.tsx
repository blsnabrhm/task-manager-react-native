import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Note, NoteTileProps } from '../types';

const NoteTile: React.FC<NoteTileProps> = ({ note, onPress, onDelete }) => {
  const { theme } = useTheme();

  // Get preview text (first 3 lines or 120 characters)
  const getPreviewText = (body: string): string => {
    if (!body) return 'No content';
    
    const lines = body.split('\n').slice(0, 3).join('\n');
    if (lines.length > 120) {
      return lines.substring(0, 117) + '...';
    }
    return lines;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: theme.background.card }]}
      onPress={() => onPress(note)}
      activeOpacity={0.7}
    >
      {/* Header with title and delete button */}
      <View style={styles.header}>
        <Text 
          style={[styles.title, { color: theme.text.primary }]} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {note.title || 'Untitled Note'}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(note.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color={theme.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Body preview */}
      <Text 
        style={[styles.preview, { color: theme.text.secondary }]}
        numberOfLines={4}
        ellipsizeMode="tail"
      >
        {getPreviewText(note.body)}
      </Text>

      {/* Footer with date */}
      <View style={styles.footer}>
        <Text style={[styles.date, { color: theme.text.muted }]}>
          {formatDate(note.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  preview: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default NoteTile;