import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"]
      },
      colors: {
        ink: {
          1: "hsl(222 20% 8%)",
          2: "hsl(222 18% 12%)",
          3: "hsl(222 14% 18%)",
          4: "hsl(222 10% 35%)"
        },
        paper: {
          1: "hsl(0 0% 100%)",
          2: "hsl(210 20% 98%)",
          3: "hsl(210 18% 95%)"
        },
        accent: {
          DEFAULT: "hsl(217 90% 55%)",
          soft: "hsl(217 90% 55% / 0.12)"
        },
        borderSubtle: "hsl(220 10% 80% / 0.35)"
      },
      boxShadow: {
        soft: "0 1px 0 hsl(0 0% 100% / 0.6) inset, 0 12px 30px hsl(222 25% 7% / 0.08)",
        lift: "0 1px 0 hsl(0 0% 100% / 0.5) inset, 0 18px 48px hsl(222 25% 7% / 0.12)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
} satisfies Config;
