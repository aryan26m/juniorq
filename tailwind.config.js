/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ff4d4f", // vibrant red for accents/buttons
          foreground: "#fff",
        },
        secondary: {
          DEFAULT: "#23272f", // dark sidebar/nav
          foreground: "#fff",
        },
        accent: {
          DEFAULT: "#ff7849", // orange accent
          foreground: "#fff",
        },
        dark: {
          DEFAULT: "#181c23", // main dashboard background
          lighter: "#23272f",
          card: "#23272f",
          sidebar: "#1a1d23",
        },
        card: {
          DEFAULT: "#23272f",
          foreground: "#fff",
        },
        gradientFrom: '#ff4d4f',
        gradientTo: '#ff7849',
        muted: {
          DEFAULT: "#2d323b",
          foreground: "#b0b8c1",
        },
        success: {
          DEFAULT: "#22c55e",
        },
        warning: {
          DEFAULT: "#facc15",
        },
        info: {
          DEFAULT: "#38bdf8",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
