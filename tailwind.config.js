/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1612",
        parchment: "#f4ead6",
        cream: "#fbf6ea",
        herb: "#24382c",
        leaf: "#3d5a45",
        copper: "#c45c26",
        ember: "#e08a4a",
        moss: "#7a8f6a",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pass: "0 24px 60px -28px rgba(28, 22, 18, 0.45)",
        stamp: "0 10px 0 0 #1c1612",
      },
    },
  },
  plugins: [],
};
