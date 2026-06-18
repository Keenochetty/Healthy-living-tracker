/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0f172a",
          muted: "#64748B",
          soft: "#94A3B8",
        },
        canvas: {
          DEFAULT: "#f8fafc",
          warm: "#f8fafc",
          cool: "#f8fafc",
        },
        wellness: {
          mint: "#e2e8f0",
          sky: "#e2e8f0",
          lavender: "#e2e8f0",
          peach: "#e2e8f0",
          lemon: "#e2e8f0",
          rose: "#e2e8f0",
          green: "#475569",
          blue: "#475569",
          purple: "#475569",
          orange: "#475569",
          red: "#991b1b",
          grey: "#667085",
        },
        realm: {
          health: "hsl(var(--health) / <alpha-value>)",
          fitness: "hsl(var(--fitness) / <alpha-value>)",
          food: "hsl(var(--food) / <alpha-value>)",
          women: "hsl(var(--women) / <alpha-value>)",
          baby: "hsl(var(--baby) / <alpha-value>)",
          family: "hsl(var(--family) / <alpha-value>)",
          records: "hsl(var(--records) / <alpha-value>)",
          meds: "hsl(var(--meds) / <alpha-value>)",
        },
        "surface-soft": "hsl(var(--surface-soft) / <alpha-value>)",
        "surface-raised": "hsl(var(--surface-raised) / <alpha-value>)",
        "surface-glass": "hsl(var(--surface-glass))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "2xl": 24,
        "3xl": 32,
        lg: "var(--radius, 18px)",
        md: "calc(var(--radius, 18px) - 2px)",
        sm: "calc(var(--radius, 18px) - 4px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [],
};
