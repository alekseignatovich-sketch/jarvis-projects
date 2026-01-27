// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        surface: '#f9fafb',
        primary: '#dc2626',
        text: '#111827',
        textSecondary: '#4b5563',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
}
