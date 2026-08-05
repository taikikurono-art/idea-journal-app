import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf6ee",
        ink: "#2b2620",
        pencil: "#8a8375",
        accent: "#b3541e",
      },
      fontFamily: {
        hand: ["Georgia", "Yu Mincho", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
