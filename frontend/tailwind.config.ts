import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--ink)",
        surface: "var(--card)",
        "surface2": "var(--card2)",
        "ink2": "var(--ink2)",
        "ink3": "var(--ink3)",
        border: "var(--border)",
        border2: "var(--border2)",
        accent: "var(--lime)",
        "accent-green": "var(--teal)",
        "accent-red": "var(--red)",
        "accent-purple": "var(--purple)",
        "accent-orange": "var(--orange)",
        "accent-blue": "var(--blue)",
        foreground: "var(--text)",
        muted: "var(--text2)",
        "muted-dark": "var(--text3)",
      },
      fontFamily: {
        sans: ["'Instrument Sans'", "sans-serif"],
        display: ["'Fraunces'", "serif"],
      },
      borderRadius: {
        xl: "var(--r)",
        "2xl": "var(--r2)",
        "3xl": "var(--r3)",
      },
    },
  },
  plugins: [],
};
export default config;
