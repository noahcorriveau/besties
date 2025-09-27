/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F3EE',
        cardBorder: '#E2E0DA',
        primary: '#8B7E6A',
        primaryHover: '#A0907A',
        textMain: '#3F3A32',
        textMuted: '#7A756A',
        sage: '#6F9D85',
      },
      borderRadius: {
        '2xl': '1rem'
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
