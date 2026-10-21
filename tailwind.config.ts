import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        // Tokens do "Sistema vivo" (docs/art-direction.md). Valores por tema em globals.css.
        bg: token("bg"),
        surface: token("surface"),
        fg: token("fg"),
        muted: token("muted"),
        line: "var(--line)",
        signal: token("signal"),
        "signal-ink": token("signal-ink"),
        alert: token("alert"),

        // Legado: usados pelas páginas que ainda serão redesenhadas (Fases 3 e 4).
        ink: {
          1: "#07080A",
          2: "#0E1014",
          3: "#171A1F",
          4: "#5A5E66"
        },
        paper: {
          1: "#ECE9E2",
          2: "#E2DED5",
          3: "#D8D3C8"
        },
        accent: {
          DEFAULT: "#D4FF3A",
          soft: "rgb(212 255 58 / 0.14)"
        },
        borderSubtle: "var(--line)"
      },
      transitionTimingFunction: {
        cine: "cubic-bezier(.76,0,.24,1)",
        snap: "cubic-bezier(.2,.8,.2,1)"
      },
      boxShadow: {
        soft: "0 1px 0 rgb(255 255 255 / 0.04) inset",
        lift: "0 1px 0 rgb(255 255 255 / 0.06) inset, 0 18px 48px rgb(0 0 0 / 0.25)"
      },
      borderRadius: {
        xl2: "0.5rem"
      }
    }
  },
  plugins: []
} satisfies Config;
