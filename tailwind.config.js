/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        "fill-available": "-webkit-fill-available",
      },
      minHeight: {
        "92vh": "92vh",
      },
      colors: {
        auth: {
          ink: "#26283b",
          muted: "#606478",
          subtle: "#b7bac3",
          line: "#dfe2ed",
          field: "#858da3",
          panel: "#f6f5f1",
          accent: "#4255ff",
          hover: "#3343dc",
          olive: "#e6eadc",
        },
        customPrimary: "#3E4FFD",
        customPrimaryHover: "#3947e9",
        customPrimaryDark: "#4255aa",
        // customBlue: "#3E4FFD",
        // customBlueHover: "#3947e9",

      },
      fontFamily: {
        'primary': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
