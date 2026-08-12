/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-soft': 'rgb(var(--brand-soft) / <alpha-value>)',
        'brand-ink': 'rgb(var(--brand-ink) / <alpha-value>)',
        store: 'rgb(var(--store) / <alpha-value>)',
        'store-soft': 'rgb(var(--store-soft) / <alpha-value>)',
        bus: 'rgb(var(--bus) / <alpha-value>)',
        'bus-soft': 'rgb(var(--bus-soft) / <alpha-value>)',
        gps: 'rgb(var(--gps) / <alpha-value>)',
        'gps-soft': 'rgb(var(--gps-soft) / <alpha-value>)',
        route: 'rgb(var(--route) / <alpha-value>)',
        'route-soft': 'rgb(var(--route-soft) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        'danger-soft': 'rgb(var(--danger-soft) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 18px 50px rgb(var(--shadow) / 0.13)',
        card: '0 8px 24px rgb(var(--shadow) / 0.08)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
