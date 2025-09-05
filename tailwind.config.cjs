/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: { 
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'pulse-border': 'pulseBorder 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBorder: {
          '0%': { borderColor: 'rgb(168, 85, 247)', boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.4)' },
          '50%': { borderColor: 'rgb(126, 34, 206)', boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.1)' },
          '100%': { borderColor: 'rgb(168, 85, 247)', boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.4)' },
        },
      },
    } 
  },
  plugins: [],
}
