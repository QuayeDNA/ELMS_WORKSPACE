// Design tokens copied from mobile theme to share across desktop app
export const colors = {
  light: {
    primary: '#2563eb',
    primaryContainer: '#dbeafe',
    secondary: '#7c3aed',
    secondaryContainer: '#ede9fe',
    tertiary: '#059669',
    tertiaryContainer: '#d1fae5',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    background: '#f8fafc',
    error: '#dc2626',
    errorContainer: '#fef2f2',
    warning: '#d97706',
    warningContainer: '#fef3c7',
    success: '#059669',
    successContainer: '#d1fae5',
    info: '#0284c7',
    infoContainer: '#e0f2fe',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onSurface: '#1e293b',
    onSurfaceVariant: '#475569',
    onBackground: '#1e293b',
    outline: '#cbd5e1',
    outlineVariant: '#e2e8f0',
  },
  dark: {
    primary: '#60a5fa',
    primaryContainer: '#1e40af',
    secondary: '#a78bfa',
    secondaryContainer: '#6d28d9',
    tertiary: '#34d399',
    tertiaryContainer: '#047857',
    surface: '#0f172a',
    surfaceVariant: '#1e293b',
    background: '#020617',
    error: '#f87171',
    errorContainer: '#991b1b',
    warning: '#f59e0b',
    warningContainer: '#92400e',
    success: '#34d399',
    successContainer: '#064e3b',
    info: '#93c5fd',
    infoContainer: '#1e3a8a',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onTertiary: '#000000',
    onSurface: '#f1f5f9',
    onSurfaceVariant: '#cbd5e1',
    onBackground: '#f1f5f9',
    outline: '#475569',
    outlineVariant: '#334155',
  }
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
}

export const typography = {
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  sizes: {
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
  },
}

export default { colors, spacing, borderRadius, typography }
