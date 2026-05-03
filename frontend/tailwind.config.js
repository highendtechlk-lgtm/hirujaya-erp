
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0B2744',
          'navy-light': '#153A61',
          green: '#22C55E',
          'green-hover': '#16A34A',
          'green-light': '#DCFCE7',
          'green-dark': '#15803D',
          blue: '#E6F0FA',
        }
      }
    },
  },
  plugins: [],
}
