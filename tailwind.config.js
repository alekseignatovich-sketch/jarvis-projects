// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Светлая тема
        background: '#ffffff',
        surface: '#f9fafb',
        primary: '#dc2626', // красный — как ты любишь
        text: '#111827',
        textSecondary: '#4b5563',
        border: '#e5e7eb',
        input: '#f3f4f6',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
