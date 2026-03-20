/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
      },
      colors: {
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        darkBorder: '#334155',
        darkText: '#CBD5E1',
        darkMuted: '#94A3B8',
        lightBg: '#F8FAFC',
        lightText: '#334155',
        lightMuted: '#64748B',
      }
    },
  },
  plugins: [],
}
