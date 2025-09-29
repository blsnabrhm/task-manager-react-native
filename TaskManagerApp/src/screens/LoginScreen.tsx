import React, { useState, useEffect } from 'react';
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
import { useAnimation } from '../contexts/AnimationContext';
import { login, register } from '../services/apiService';
import { LoadingSpinner } from '../components';

const LoginScreen: React.FC = () => {
  const { login: authLogin } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { triggerFadeIn } = useAnimation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    triggerFadeIn();
  }, [triggerFadeIn]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });

  const handleSubmit = async () => {
    // Clear previous error
    setErrorMessage('');

    if (!formData.username || !formData.password) {
      setErrorMessage('Username and password are required');
      return;
    }

    if (!isLogin && !formData.name) {
      setErrorMessage('Name is required for registration');
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
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage(''); // Clear error when switching modes
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
        <View style={styles.themeToggleContainer}>
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: theme.background.card }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.themeToggleText, { color: theme.text.primary }]}>
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </TouchableOpacity>
        </View>

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
              onChangeText={(text) => {
                setFormData({ ...formData, username: text });
                if (errorMessage) setErrorMessage(''); // Clear error when typing
              }}
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
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errorMessage) setErrorMessage(''); // Clear error when typing
              }}
              secureTextEntry
            />

            {errorMessage ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.danger + '15' }]}>
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

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
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
  themeToggleContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  themeToggle: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;