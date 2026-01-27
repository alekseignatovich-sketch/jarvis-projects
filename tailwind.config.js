/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        primary: '#dc2626',
      }
    },
  },
  plugins: [],
}
