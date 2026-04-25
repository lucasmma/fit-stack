import type { Config } from "tailwindcss";
// HeroUI bundles its own Tailwind plugin types. The shape is runtime-compatible
// with our host Tailwind, but the type definitions diverge — wrap accordingly.
import { heroui } from "@heroui/react";

const heroPlugin = heroui({
  themes: {
    light: {
      colors: {
        primary: { DEFAULT: "#2563eb", foreground: "#ffffff" },
      },
    },
    dark: {
      colors: {
        primary: { DEFAULT: "#3b82f6", foreground: "#ffffff" },
      },
    },
  },
}) as unknown as NonNullable<Config["plugins"]>[number];

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@heroui/**/dist/**/*.{js,ts,jsx,tsx,mjs}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroPlugin],
};

export default config;
