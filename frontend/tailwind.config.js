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
        // Neobrutalism palette
        neo: {
          bg: '#fffef7',
          surface: '#ffffff',
          border: '#2d2d2d',
          text: '#2d2d2d',
          muted: '#6b7280',
          primary: '#ff6b6b',
          secondary: '#4ecdc4',
          accent: '#ffe66d',
          success: '#51cf66',
          warning: '#fcc419',
          danger: '#ff4757',
          purple: '#a855f7',
          blue: '#3b82f6',
          orange: '#fb923c',
          pink: '#ec4899',
        },
        // Keep brand for backward compat
        brand: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc2c2',
          300: '#ff9999',
          400: '#ff6b6b',
          500: '#ff5252',
          600: '#ff3333',
          700: '#e60000',
          800: '#b30000',
          900: '#800000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #2d2d2d',
        'neo-sm': '2px 2px 0px 0px #2d2d2d',
        'neo-lg': '6px 6px 0px 0px #2d2d2d',
        'neo-xl': '8px 8px 0px 0px #2d2d2d',
        'neo-primary': '4px 4px 0px 0px #ff6b6b',
        'neo-secondary': '4px 4px 0px 0px #4ecdc4',
        'neo-accent': '4px 4px 0px 0px #ffe66d',
        'neo-dark': '4px 4px 0px 0px #1a1a2e',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
