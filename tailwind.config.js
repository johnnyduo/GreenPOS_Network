/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'emerald-bright': '#10B981',
        'teal-bright': '#14B8A6',
        'charcoal': '#374151',
        'glass-white': 'rgba(255, 255, 255, 0.9)',
        'glass-border': 'rgba(229, 231, 235, 0.8)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'float': 'float 3s ease-in-out infinite',
        'particle-flow': 'particle-flow 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
            opacity: '1',
          },
          '80%, 100%': {
            transform: 'scale(2.4)',
            opacity: '0',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'particle-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-emerald-50',
    'bg-blue-50',
    'bg-purple-50',
    'bg-orange-50',
    'text-emerald-600',
    'text-blue-600',
    'text-purple-600',
    'text-orange-600',
    'text-emerald-700',
    'text-blue-700',
    'text-purple-700',
    'text-orange-700',
    'line-clamp-2',
  ],
};