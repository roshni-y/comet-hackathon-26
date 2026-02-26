/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-primary': '#3ca3a0',
        'teal-bg': '#f8fdfd',
      }
    },
  },
  plugins: [],
}