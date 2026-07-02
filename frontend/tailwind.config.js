import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        brightgreen: {
          primary: "#22B14C",
          "primary-content": "#FFFFFF",
          secondary: "#0E7C3F",
          "secondary-content": "#FFFFFF",
          accent: "#7ED957",
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