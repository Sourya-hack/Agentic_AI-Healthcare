/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        mist: "#edf5f7",
        accent: "#0f766e",
        ember: "#c2410c",
        gold: "#ca8a04",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        panel: "0 12px 32px rgba(16,33,43,0.12)",
      },
    },
  },
  plugins: [],
};

