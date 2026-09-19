const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false, // keep MUI's CssBaseline; Tailwind used for utility layout only
  },
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        ink: '#111827',
        muted: '#6B7280',
        line: '#E5E7EB',
        primary: '#2563EB',
        success: '#16A34A',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.06)',
        lift: '0 2px 4px rgba(17,24,39,0.05), 0 12px 32px rgba(17,24,39,0.10)',
      },
    },
  },
  plugins: [],
};