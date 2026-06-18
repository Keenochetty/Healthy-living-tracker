import type { UserThemeKey } from "@/types/profile";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  "2xl": 34,
  full: 999,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 36,
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

export const defaultThemeKey: UserThemeKey = "clean_blue";

const blankLightTheme: AppTheme = {
  accent: "#64748b",
  accentBlue: "#64748b",
  accentGreen: "#64748b",
  accentOrange: "#64748b",
  accentPink: "#64748b",
  background: "#f8fafc",
  border: "#e2e8f0",
  card: "#ffffff",
  danger: "#dc2626",
  info: "#475569",
  mutedText: "#64748b",
  nav: "#ffffff",
  primary: "#475569",
  primarySoft: "#e2e8f0",
  secondary: "#64748b",
  success: "#15803d",
  surface: "#ffffff",
  surfaceSoft: "#f1f5f9",
  subtleText: "#94a3b8",
  text: "#0f172a",
  warning: "#a16207",
};

const blankDarkTheme: AppTheme = {
  accent: "#94a3b8",
  accentBlue: "#94a3b8",
  accentGreen: "#94a3b8",
  accentOrange: "#94a3b8",
  accentPink: "#94a3b8",
  background: "#020617",
  border: "#1e293b",
  card: "#0f172a",
  danger: "#f87171",
  info: "#cbd5e1",
  mutedText: "#94a3b8",
  nav: "#0f172a",
  primary: "#cbd5e1",
  primarySoft: "#1e293b",
  secondary: "#94a3b8",
  success: "#86efac",
  surface: "#0f172a",
  surfaceSoft: "#111827",
  subtleText: "#64748b",
  text: "#f8fafc",
  warning: "#fde68a",
};

export const themes: Record<UserThemeKey, AppTheme> = {
  soft_lavender: blankLightTheme,
  zest_green: blankLightTheme,
  peach_parenting: blankLightTheme,
  clean_blue: blankLightTheme,
  calm_dark: blankDarkTheme,
  premium_dark_health: blankDarkTheme,
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
  offline: "#94a3b8",
} as const;

export type StatusKey = keyof typeof statusColours;

export function getTheme(themeKey?: UserThemeKey | null) {
  return themes[themeKey ?? defaultThemeKey] ?? themes[defaultThemeKey];
}
