/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Newsreader"', '"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        wall: {
          bg: '#FBFBFA',
          surface: '#FFFFFF',
          dark: '#111111',
          muted: '#6E6E6A',
          subtle: '#969690',
          border: '#E7E7E2',
          lightBorder: '#F0F0EB',
          accent: '#181816',
          highlight: '#F5F5F0',
          todayBg: '#F7F7F3',
        }
      },
    },
  },
  plugins: [],
}
