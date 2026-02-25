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
        spa: {
          bg:          "#FDFAF6",
          surface:     "#F5F0E8",
          border:      "#E8E0D0",
          text:        "#1A1614",
          muted:       "#8C7E72",
          accent:      "#9C6B4E",
          accentLight: "#F0E4D8",
          ringTrack:   "#EDE5DC",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
