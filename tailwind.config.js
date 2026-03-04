/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'mallard-green': '#0B3D2E',
        'mallard-green-light': '#166653',
        'mallard-yellow': '#F5B800',
        'mallard-yellow-light': '#FFD54F',
        'sky-dawn': '#1e3a5f',
        'sky-morning': '#3b82f6',
        'water-blue': '#0ea5e9',
        'dark-bg': '#0B0E14',
        'dark-card': '#141922',
        'dark-card-border': '#1E2633',
      },
    },
  },
  plugins: [],
};
