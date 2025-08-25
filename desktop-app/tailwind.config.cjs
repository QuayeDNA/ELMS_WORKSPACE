/** @type {import('tailwindcss').Config} */
import tokens from './src/design-system/tokens'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}'
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        tertiary: tokens.colors.tertiary,
        surface: tokens.colors.surface,
        background: tokens.colors.background,
        info: tokens.colors.info,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
      },
      spacing: {
        'xs': `${tokens.spacing.xs}px`,
        'sm': `${tokens.spacing.sm}px`,
        'md': `${tokens.spacing.md}px`,
        'lg': `${tokens.spacing.lg}px`,
        'xl': `${tokens.spacing.xl}px`,
      },
      borderRadius: {
        sm: `${tokens.borderRadius.sm}px`,
        md: `${tokens.borderRadius.md}px`,
        lg: `${tokens.borderRadius.lg}px`,
        xl: `${tokens.borderRadius.xl}px`,
        full: '9999px',
      },
      fontFamily: {
        sans: [tokens.typography.fontFamily],
      }
    }
  },
  plugins: [],
}
