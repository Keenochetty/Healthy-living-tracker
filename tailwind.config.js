/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#17202A",
          muted: "#64748B",
          soft: "#94A3B8"
        },
        canvas: {
          DEFAULT: "#FAF8F4",
          warm: "#FFFDF8",
          cool: "#F5F8FB"
        },
        wellness: {
          mint: "#DFF6EE",
          sky: "#DDEEFF",
          lavender: "#EEE7FF",
          peach: "#FFE9DA",
          lemon: "#FFF4C7",
          rose: "#FFE4E6",
          green: "#2E7D5B",
          blue: "#2563A9",
          purple: "#6D5BD0",
          orange: "#C56A2A",
          red: "#B42318",
          grey: "#667085"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        "2xl": 24,
        "3xl": 32,
        lg: "var(--radius, 18px)",
        md: "calc(var(--radius, 18px) - 2px)",
        sm: "calc(var(--radius, 18px) - 4px)"
      },
      boxShadow: {
        card: "0 14px 40px rgba(15, 23, 42, 0.08)",
        soft: "0 10px 28px rgba(37, 99, 169, 0.12)"
      }
    }
  },
  plugins: []
};
