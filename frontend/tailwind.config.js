/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F2',
        ink: '#1F2A44',
        rule: '#D8D9D2',
        accent: '#2C5F7C',
        correct: '#2F6B4F',
        'correct-bg': '#EAF3EC',
        incorrect: '#A6402F',
        'incorrect-bg': '#F7EAE7',
        muted: '#6B7280',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
