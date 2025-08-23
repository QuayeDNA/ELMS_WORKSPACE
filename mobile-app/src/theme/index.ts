import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// ELMS Brand Colors
export const colors = {
  primary: '#2563eb', // Blue 600
  primaryContainer: '#dbeafe', // Blue 100
  secondary: '#7c3aed', // Violet 600
  secondaryContainer: '#ede9fe', // Violet 100
  tertiary: '#059669', // Emerald 600
  tertiaryContainer: '#d1fae5', // Emerald 100
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9', // Slate 100
  background: '#f8fafc', // Slate 50
  error: '#dc2626', // Red 600
  errorContainer: '#fef2f2', // Red 50
  warning: '#d97706', // Amber 600
  warningContainer: '#fef3c7', // Amber 100
  success: '#059669', // Emerald 600
  successContainer: '#d1fae5', // Emerald 100
  info: '#0284c7', // Sky 600
  infoContainer: '#e0f2fe', // Sky 50
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onTertiary: '#ffffff',
  onSurface: '#1e293b', // Slate 800
  onSurfaceVariant: '#475569', // Slate 600
  onBackground: '#1e293b', // Slate 800
  onError: '#ffffff',
  outline: '#cbd5e1', // Slate 300
  outlineVariant: '#e2e8f0', // Slate 200
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1e293b', // Slate 800
  inverseOnSurface: '#f1f5f9', // Slate 100
  inversePrimary: '#93c5fd', // Blue 300
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60a5fa', // Blue 400
    primaryContainer: '#1e40af', // Blue 700
    secondary: '#a78bfa', // Violet 400
    secondaryContainer: '#6d28d9', // Violet 700
    tertiary: '#34d399', // Emerald 400
    tertiaryContainer: '#047857', // Emerald 700
    surface: '#1e293b', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    background: '#0f172a', // Slate 900
    error: '#f87171', // Red 400
    errorContainer: '#991b1b', // Red 800
    onPrimary: '#000000',
    onSecondary: '#000000',
    onTertiary: '#000000',
    onSurface: '#f1f5f9', // Slate 100
    onSurfaceVariant: '#cbd5e1', // Slate 300
    onBackground: '#f1f5f9', // Slate 100
    onError: '#000000',
    outline: '#64748b', // Slate 500
    outlineVariant: '#475569', // Slate 600
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#f1f5f9', // Slate 100
    inverseOnSurface: '#1e293b', // Slate 800
    inversePrimary: '#2563eb', // Blue 600
  },
};

// Typography
export const typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Enhanced theme object with all design tokens
export const theme = {
  ...lightTheme,
  spacing,
  borderRadius,
  shadows,
  typography,
  // Legacy text colors for backward compatibility
  colors: {
    ...lightTheme.colors,
    text: {
      primary: lightTheme.colors.onBackground,
      secondary: lightTheme.colors.onSurfaceVariant,
    },
    border: lightTheme.colors.outline,
  },
};

export default theme;
