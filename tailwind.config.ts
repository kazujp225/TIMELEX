import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // General UI v1 Tokens
        brand: {
          600: "#2563eb",
          500: "#3b82f6",
          400: "#60a5fa",
          50: "#eff6ff",
        },
        text: "#0f172a",
        muted: "#64748b",
        panel: "#ffffff",
        "panel-muted": "#f8fafc",
        border: "#e5e7eb",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#06b6d4",
        // Legacy colors (for gradual migration)
        primary: {
          DEFAULT: "#6EC5FF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFC870",
          foreground: "#2D2D2D",
        },
        destructive: {
          DEFAULT: "#FF7676",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: "16px", // --radius
        lg: "12px", // --radius-sm
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        elev: "0 8px 24px rgba(2, 6, 23, 0.06), 0 1px 2px rgba(2, 6, 23, 0.06)", // --shadow
        sm: "0 1px 2px rgba(2, 6, 23, 0.06)", // --shadow-sm
        custom: "0 4px 8px rgba(0, 0, 0, 0.06)", // legacy
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "check-draw": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-in-out",
        "scale-in": "scale-in 0.2s ease-out",
        "check-draw": "check-draw 0.8s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
