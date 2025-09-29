import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AppTileProps } from '../types';

const AppTile: React.FC<AppTileProps> = ({ app, onPress }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (app.isEnabled) {
      onPress(app.route);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        { 
          backgroundColor: theme.background.card,
          borderColor: theme.border.light,
        },
        !app.isEnabled && styles.disabledTile
      ]}
      onPress={handlePress}
      disabled={!app.isEnabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: app.color + '20' }]}>
        <Text style={[styles.icon, { color: app.color }]}>{app.icon}</Text>
      </View>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title, 
            { color: theme.text.primary },
            !app.isEnabled && { color: theme.text.muted }
          ]}
          numberOfLines={1}
        >
          {app.title}
        </Text>
        <Text 
          style={[
            styles.description, 
            { color: theme.text.secondary },
            !app.isEnabled && { color: theme.text.muted }
          ]}
          numberOfLines={2}
        >
          {app.description}
        </Text>
      </View>

      {!app.isEnabled && (
        <View style={[styles.comingSoonBadge, { backgroundColor: theme.text.muted }]}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  disabledTile: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AppTile;