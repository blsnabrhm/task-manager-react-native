import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { login, register } from '../services/apiService';
import { LoadingSpinner } from '../components';

const LoginScreen: React.FC = () => {
  const { login: authLogin } = useAuth();
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert('Error', 'Username and password are required');
      return;
    }

    if (!isLogin && !formData.name) {
      Alert.alert('Error', 'Name is required for registration');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        response = await register({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
        });
      }

      if (response.success && response.data) {
        await authLogin(response.data);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            {isLogin ? 'Sign in to your workspace' : 'Join to create your workspace'}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.card,
                borderColor: theme.border.light,
                color: theme.text.primary 
              }]}
              placeholder="Username"
              placeholderTextColor={theme.text.secondary}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
            />

            {!isLogin && (
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background.card,
                  borderColor: theme.border.light,
                  color: theme.text.primary 
                }]}
                placeholder="Full Name"
                placeholderTextColor={theme.text.secondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            )}

            {!isLogin && (
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background.card,
                  borderColor: theme.border.light,
                  color: theme.text.primary 
                }]}
                placeholder="Email (optional)"
                placeholderTextColor={theme.text.secondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.card,
                borderColor: theme.border.light,
                color: theme.text.primary 
              }]}
              placeholder="Password"
              placeholderTextColor={theme.text.secondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleButtonText, { color: theme.primary }]}>
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;