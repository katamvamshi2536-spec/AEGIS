/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#06090e',
          900: '#0b111e',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          border: 'rgba(255, 255, 255, 0.08)',
          card: 'rgba(15, 23, 42, 0.75)',
        },
        ring: {
          blue: '#0284c7',
          cyan: '#06b6d4',
          alert: '#ef4444',
          warn: '#f59e0b',
          safe: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -3px rgba(2, 132, 199, 0.35)',
        'glow-red': '0 0 25px -2px rgba(239, 68, 68, 0.45)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
