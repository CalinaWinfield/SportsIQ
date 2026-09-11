/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        espn: {
          red: '#38bdf8',         // Light sky blue accent
          darkred: '#0284c7',     // Darker sky blue
          brightred: '#7dd3fc',   // Very light sky blue
          dark: '#0a0e17',
          panel: '#111827',
          card: '#151f30',
          border: '#243248',
          accent: '#2a3a52'
        },
        brand: {
          DEFAULT: '#38bdf8',
          light: '#7dd3fc',
          dark: '#0284c7',
          deep: '#0369a1'
        }
      },
      fontFamily: {
        sports: ['Teko', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 40s linear infinite'
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    },
  },
  plugins: [],
};
