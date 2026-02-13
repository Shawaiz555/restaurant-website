/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Option 2: Deep Orange & Warm Brown (Bold & Energetic)
        primary: "#E67E22", // Vibrant orange
        "primary-dark": "#D35400", // Deep orange
        "primary-light": "#F39C12", // Bright orange
        cream: "#FDF6E3", // Soft beige
        "cream-light": "#FFFBF5", // Very light beige
        "cream-dark": "#F5E6D3", // Medium beige
        "cream-darker": "#EDD5BA", // Darker beige
        "cream-hero": "#FDF6E3", // Hero section beige
        dark: "#1E1E1E",
        "dark-gray": "#4A4A4A",
        orange: "#F4A340", // Keep old primary as orange for accent use
        "orange-dark": "#E89530",
      },
      fontFamily: {
        display: ["Righteous", "cursive"],
        body: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
