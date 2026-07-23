/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ybs-yellow': '#ffd200',
        'ybs-yellow-dark': '#725c00',
        'transit-blue': '#1d5fa8',
        'transit-blue-dark': '#00417e',
        'transit-blue-light': '#7ab0ff',
        'cloud-blue': '#ebf2f8',
      },
    },
  },
  plugins: [],
};
