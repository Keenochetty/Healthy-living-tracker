import type { UserThemeKey } from "@/types/profile";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  "2xl": 34,
  full: 999
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 36
} as const;

export type AppTheme = {
  accent: string;
  accentBlue?: string;
  accentGreen?: string;
  accentOrange?: string;
  accentPink?: string;
  background: string;
  border: string;
  card?: string;
  danger: string;
  info: string;
  mutedText: string;
  nav?: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  surface: string;
  surfaceSoft?: string;
  subtleText?: string;
  success: string;
  text: string;
  warning: string;
};

export const defaultThemeKey: UserThemeKey = "soft_lavender";

export const themes: Record<UserThemeKey, AppTheme> = {
  soft_lavender: {
    background: "#fbf8ff",
    surface: "#ffffff",
    primary: "#8b5cf6",
    primarySoft: "#ede9fe",
    secondary: "#f472b6",
    accent: "#fbbf24",
    text: "#0f172a",
    mutedText: "#64748b",
    border: "#ede9f5",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  },
  zest_green: {
    background: "#f7fee7",
    surface: "#ffffff",
    primary: "#22c55e",
    primarySoft: "#dcfce7",
    secondary: "#14b8a6",
    accent: "#facc15",
    text: "#0f172a",
    mutedText: "#64748b",
    border: "#e2e8f0",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  },
  peach_parenting: {
    background: "#fff7ed",
    surface: "#ffffff",
    primary: "#fb7185",
    primarySoft: "#ffe4e6",
    secondary: "#f97316",
    accent: "#facc15",
    text: "#0f172a",
    mutedText: "#64748b",
    border: "#fed7aa",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  },
  clean_blue: {
    background: "#eff6ff",
    surface: "#ffffff",
    primary: "#3b82f6",
    primarySoft: "#dbeafe",
    secondary: "#06b6d4",
    accent: "#a78bfa",
    text: "#0f172a",
    mutedText: "#64748b",
    border: "#bfdbfe",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  },
  calm_dark: {
    background: "#0f172a",
    surface: "#1e293b",
    primary: "#a78bfa",
    primarySoft: "#312e81",
    secondary: "#38bdf8",
    accent: "#f59e0b",
    text: "#f8fafc",
    mutedText: "#cbd5e1",
    border: "#334155",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  },
  premium_dark_health: {
    background: "#171b22",
    surface: "#222832",
    surfaceSoft: "#2b323d",
    card: "#252b35",
    primary: "#ffd029",
    primarySoft: "#3b341e",
    secondary: "#8b5cf6",
    accent: "#ffd029",
    accentOrange: "#ff9f43",
    accentBlue: "#38bdf8",
    accentGreen: "#86efac",
    accentPink: "#f472b6",
    text: "#f8fafc",
    mutedText: "#a8b0bd",
    subtleText: "#747d8c",
    border: "#313946",
    nav: "#10141b",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#38bdf8"
  }
};

export const statusColours = {
  okay: "#22c55e",
  attention: "#f59e0b",
  urgent: "#ef4444",
  private: "#8b5cf6",
  scheduled: "#3b82f6",
  completed: "#22c55e",
  pending: "#f59e0b",
  synced: "#14b8a6",
  offline: "#94a3b8"
} as const;

export type StatusKey = keyof typeof statusColours;

export function getTheme(themeKey?: UserThemeKey | null) {
  return themes[themeKey ?? defaultThemeKey] ?? themes[defaultThemeKey];
}
