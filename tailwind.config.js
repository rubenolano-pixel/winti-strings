/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tennis-green': '#0f7c3a',
        'tennis-green-light': '#e8f5ee',
        'tennis-green-dark': '#0a5a29',
        'tennis-yellow': '#f4c430',
        'tennis-bg': '#fafaf7',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

