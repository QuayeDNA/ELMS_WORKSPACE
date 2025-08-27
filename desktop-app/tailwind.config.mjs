/** @type {import('tailwindcss').Config} */
import tokens from './src/design-system/tokens.mjs'
import { heroui } from '@heroui/theme'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    // Include HeroUI compiled component styles so Tailwind can tree-shake them
    './node_modules/@heroui/theme/dist/components/**/*.{js,mjs,cjs}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: tokens?.colors?.primary,
        secondary: tokens?.colors?.secondary,
        tertiary: tokens?.colors?.tertiary,
        surface: tokens?.colors?.surface,
        background: tokens?.colors?.background,
        info: tokens?.colors?.info,
        success: tokens?.colors?.success,
        warning: tokens?.colors?.warning,
        error: tokens?.colors?.error,
      },
      spacing: {
        xs: `${tokens?.spacing?.xs || 4}px`,
        sm: `${tokens?.spacing?.sm || 8}px`,
        md: `${tokens?.spacing?.md || 16}px`,
        lg: `${tokens?.spacing?.lg || 24}px`,
        xl: `${tokens?.spacing?.xl || 32}px`,
      },
      borderRadius: {
        sm: `${tokens?.borderRadius?.sm || 4}px`,
        md: `${tokens?.borderRadius?.md || 8}px`,
        lg: `${tokens?.borderRadius?.lg || 12}px`,
        xl: `${tokens?.borderRadius?.xl || 16}px`,
        full: '9999px',
      },
      fontFamily: {
        sans: [tokens?.typography?.fontFamily || 'ui-sans-serif', 'system-ui'],
      }
    }
  },
  plugins: [heroui()],
}
