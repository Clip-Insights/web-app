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
