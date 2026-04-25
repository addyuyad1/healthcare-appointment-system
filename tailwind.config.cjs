/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf7",
          100: "#d6f4eb",
          200: "#b0e8d8",
          300: "#7bd6bc",
          400: "#45bf9c",
          500: "#23a182",
          600: "#16806a",
          700: "#146656",
          800: "#155146",
          900: "#13433b",
        },
        accent: {
          50: "#f3f7ff",
          100: "#e8f0ff",
          200: "#d5e3ff",
          300: "#b4ccff",
          400: "#8caeff",
          500: "#5f88ff",
          600: "#3f64f0",
          700: "#3150d5",
          800: "#3045aa",
          900: "#2d3f85",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
