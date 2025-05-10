// Providers/ThemeProvider.tsx
import React, { createContext, useContext } from 'react';
import { Appearance } from 'react-native';

const ThemeColors = {
  light: {
    background: '#FFFFFF',
    text: '#333333',
    primary: '#084C61',
    secondary: '#F1F1F1',
    error: '#FF5A5F',
    card: '#FFF',
    border: '#ccc',
  },
  dark: {
    background: '#121212',
    text: '#E0E0E0',
    primary: '#1E88E5',
    secondary: '#888',
    error: '#FF6E6E',
    card: '#1E1E1E',
    border: '#555',
  },
};

const ThemeContext = createContext(ThemeColors.light);

export const ThemeProvider = ({ children }: any) => {
  const colorScheme = Appearance.getColorScheme(); // 'light' or 'dark'
  const theme = colorScheme === 'dark' ? ThemeColors.dark : ThemeColors.light;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
