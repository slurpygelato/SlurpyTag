// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "slurpy-pink": "#FF8CB8", // Sostituisci con il tuo HEX esatto
        "slurpy-cream": "#FFF9F1", // Il colore dello sfondo
        "slurpy-black": "#000000",
      },
      borderRadius: {
        "slurpy-card": "50px",
        "slurpy-btn": "100px",
        "slurpy-input": "24px",
      },
      boxShadow: {
        "slurpy": "0 10px 0px rgba(0, 0, 0, 0.05)", // Ombra piatta stile cartoon
      },
    },
  },
  plugins: [],
};
export default config;