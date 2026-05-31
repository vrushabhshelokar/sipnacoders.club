/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 allows us to toggle dark mode by applying a class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED', // violet accent
        secondary: '#9333EA',
        background: '#000000', // dark background
        surface: '#1A1A24', // card surface
        background: '#000000',
      },
    },
  },
  plugins: [],
  
}
