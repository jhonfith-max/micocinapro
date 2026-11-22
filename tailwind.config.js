/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1B19",
        parchment: "#F6F4F1",
        cream: "#F6F4F1",
        herb: "#1C1B19",
        leaf: "#6B6560",
        copper: "#C45C26",
        ember: "#A34B1E",
        moss: "#6B6560",
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
