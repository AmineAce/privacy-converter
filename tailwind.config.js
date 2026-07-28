/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blackest: '#0a0a0a',
          dark: '#1a1a1a',
          sage: '#9ca89a',
          mist: '#e2e8e0',
          neon: '#00ff88',
        },
      },
    },
  },
  plugins: [],
}
