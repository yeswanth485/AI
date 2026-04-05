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
        "surface3": "var(--card3)",
        "ink2": "var(--ink2)",
        "ink3": "var(--ink3)",
        border: "var(--border)",
        border2: "var(--border2)",
        border3: "var(--border3)",
        accent: "var(--lime)",
        "accent-green": "var(--teal)",
        "accent-red": "var(--red)",
        "accent-purple": "var(--purple)",
        "accent-orange": "var(--orange)",
        "accent-blue": "var(--blue)",
        "accent-amber": "var(--amber)",
        foreground: "var(--text)",
        muted: "var(--text2)",
        "muted-dark": "var(--text3)",
        teal: "var(--teal)",
        purple: "var(--purple)",
        blue: "var(--blue)",
        orange: "var(--orange)",
        red: "var(--red)",
        lime: "var(--lime)",
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
      boxShadow: {
        "glow-lime": "var(--glow-lime)",
        "glow-teal": "var(--glow-teal)",
        "glow-purple": "var(--glow-purple)",
      },
    },
  },
  plugins: [],
};
export default config;
