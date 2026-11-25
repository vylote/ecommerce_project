const daisyui = require("daisyui");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        brightgreen: {
          primary: colors.green[600],
          "primary-content": "#FFFFFF",
          secondary: colors.green[700],
          "secondary-content": "#FFFFFF",
          accent: colors.green[500],
          "accent-content": "#12210A",
          neutral: "#16241A",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#F4FAF1",
          "base-300": "#E5F2DE",
          "base-content": "#16241A",
          error: "#E5484D",
          "error-content": "#FFFFFF",

          "--rounded-box": "1.5rem",
          "--rounded-btn": "0.85rem",
          "--rounded-badge": "1rem",
        },
      },
    ],
  },
};
