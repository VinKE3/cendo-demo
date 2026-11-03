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
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
        },
        accent: {
          soft: "var(--color-accent-soft)",
        },
        main: "var(--color-bg-main)",
        surface: "var(--color-surface)",
        theme: "var(--color-border)",
        border: "var(--color-border)",
        heading: "var(--color-text-heading)",
        body: "var(--color-text-body)",
        muted: "var(--color-text-muted)",
        status: {
          normal: "var(--color-status-normal)",
          alert: "var(--color-status-alert)",
        },
      },
      textColor: {
        heading: "var(--color-text-heading)",
        body: "var(--color-text-body)",
        muted: "var(--color-text-muted)",
      },
      borderColor: {
        theme: "var(--color-border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

