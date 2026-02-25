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
          bg:          "rgb(var(--color-bg) / <alpha-value>)",
          surface:     "rgb(var(--color-surface) / <alpha-value>)",
          border:      "rgb(var(--color-border) / <alpha-value>)",
          text:        "rgb(var(--color-text) / <alpha-value>)",
          muted:       "rgb(var(--color-muted) / <alpha-value>)",
          accent:      "rgb(var(--color-accent) / <alpha-value>)",
          accentLight: "rgb(var(--color-accent-light) / <alpha-value>)",
          ringTrack:   "rgb(var(--color-ring-track) / <alpha-value>)",
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
