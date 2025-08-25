import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // if you ever have root app/
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // root components
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // root pages
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // EVERYTHING under src
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF", // card base
        foreground: "#0F172A", // text
        primary: "#F43F5E", // rose CTA
        secondary: "#6366F1", // indigo CTA
        highlight: "#F59E0B", // amber highlight
        neutral: "#CBD5E1", // muted
      },
      backgroundImage: {
        "app-light": "url('/images/background.jpg')",
      },
    },
  },
  darkMode: "class",
} satisfies Config;
