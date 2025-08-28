/** @type {import('tailwindcss').Config} */
import tokens from './src/design-system/tokens.mjs'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colors are now defined in CSS using @theme directive
        // Remove these since we're using CSS-based theming for Tailwind v4
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
  plugins: [],
}
