// src/styles/colors.ts - Color Palette with Light/Dark Themes
export const lightTheme = {
  primary: '#007bff',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  secondary: '#6c757d',
  white: '#fff',
  border: {
    light: '#dee2e6',
    medium: '#ced4da',
    checkbox: '#ced4da',
  },
  text: {
    primary: '#212529',
    secondary: '#6c757d',
    muted: '#868e96',
    white: '#fff',
  },
  background: {
    primary: '#f8f9fa',
    white: '#fff',
    disabled: '#f8f9fa',
    card: '#ffffff',
  },
  header: {
    background: '#ffffff',
    text: '#212529',
    border: '#e9ecef',
  },
};

export const darkTheme = {
  primary: '#0d6efd',
  success: '#198754',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#0dcaf0',
  secondary: '#6c757d',
  white: '#fff',
  border: {
    light: '#6c757d',
    medium: '#adb5bd',
    checkbox: '#adb5bd',
  },
  text: {
    primary: '#f8f9fa',
    secondary: '#adb5bd',
    muted: '#6c757d',
    white: '#fff',
  },
  background: {
    primary: '#212529',
    white: '#343a40',
    disabled: '#495057',
    card: '#495057',
  },
  header: {
    background: '#343a40',
    text: '#f8f9fa',
    border: '#495057',
  },
};

// Default export for backward compatibility
export const colors = lightTheme;