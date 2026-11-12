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
        tn: {
          green: "#0B6623",
          greenHover: "#09531D",
          lightGreen: "#E8F5E9",
          orange: "#E65100",
          lightOrange: "#FFF3E0",
          dark: "#1A202C",
          surface: "#F8FAFC",
        },
      },
      fontFamily: {
        tamil: ["var(--font-noto-tamil)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};
export default config;

