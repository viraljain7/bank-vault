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
        canvas: '#F5F3F0',
        surface: '#FDFCFA',
        ink: '#1C1A18',
        muted: '#6E6862',
        line: '#E4DFD7',
        primary: '#1F6B4A',
        success: '#0F766E',
        danger: '#C42B2B',
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '0px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.06)',
        lift: '0 2px 4px rgba(17,24,39,0.05), 0 12px 32px rgba(17,24,39,0.10)',
      },
    },
  },
  plugins: [],
};