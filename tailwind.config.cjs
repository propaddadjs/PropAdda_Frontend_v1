const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        themeOrange: "#FF671F",
        hoverOrange: "#c64413",
        buttonOrange: "#ff661f53",
        // ...colors,
      },
      fontFamily: {
        // Add this line
        times: ['"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("tailwindcss-animate"),
  ],
};
