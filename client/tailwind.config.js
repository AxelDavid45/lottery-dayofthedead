/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dia-orange': '#ffb347',
        'dia-purple': '#7a1fa2',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'atkinson': ['Atkinson Hyperlegible', 'sans-serif'],
      },
    },
  },
  plugins: [],
}