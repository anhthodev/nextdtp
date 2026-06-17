import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        dark: {
          bg: "#0a0e27",
          "bg-secondary": "#0f1535",
          card: "#1a1f3a",
          border: "#27306d",
          text: "#e0e9ff",
        },
        accent: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          cyan: "#06b6d4",
          violet: "#7c3aed",
        },
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.5)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.5)",
        smooth: "0 8px 32px rgba(0, 0, 0, 0.1)",
        "smooth-dark": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "inner-dark": "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial-dark":
          "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
        "gradient-radial-purple":
          "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
