/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F4A340",
        "primary-dark": "#E89530",
        cream: "#FFF8F0",
        "cream-light": "#FFFBF5",
        dark: "#1E1E1E",
        "dark-gray": "#4A4A4A",
      },
      fontFamily: {
        display: ["Righteous", "cursive"],
        body: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
