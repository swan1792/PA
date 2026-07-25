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
        // Core palette - clean and minimal
        neo: {
          bg: '#fafafa',
          surface: '#ffffff',
          border: '#e5e5e5',
          borderDark: '#d4d4d4',
          text: '#1a1a1a',
          textSecondary: '#6b7280',
          muted: '#a3a3a3',
          primary: '#6366f1',
          primaryHover: '#4f46e5',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          success: '#22c55e',
          successBg: '#f0fdf4',
          warning: '#f59e0b',
          warningBg: '#fffbeb',
          danger: '#ef4444',
          dangerBg: '#fef2f2',
          purple: '#a855f7',
          blue: '#3b82f6',
          blueBg: '#eff6ff',
          orange: '#fb923c',
          pink: '#ec4899',
        },
        // Keep brand for backward compat (mapped to indigo)
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Sidebar specific
        sidebar: {
          bg: '#f7f7f7',
          hover: '#eaeaea',
          active: '#e2e2e2',
          text: '#4a4a4a',
          icon: '#6b6b6b',
          darkBg: '#1e1e2e',
          darkHover: '#2a2a3e',
          darkActive: '#33334a',
          darkText: '#c0c0d0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'section-title': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.06)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'sidebar': '1px 0 3px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'pill': '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.15s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'bounce-slow': 'bounceSlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
