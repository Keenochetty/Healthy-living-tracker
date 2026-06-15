import { useColorScheme } from "react-native";

export const realmColors = {
  health: "#70F1C7",
  fitness: "#9AFF6F",
  food: "#FFB85C",
  women: "#FF86BF",
  baby: "#FFD76A",
  family: "#8CB7FF",
  medication: "#B99BFF",
  records: "#8BE4FF",
  mind: "#B5FFDF",
} as const;

const sharedColors = {
  realm: realmColors,
  brand: {
    primary: realmColors.health,
    primarySoft: "#173B38",
    secondary: "#65D8FF",
    secondarySoft: "#173543",
  },
  accent: {
    coral: "#FF6F8E",
    peach: "#3C2929",
    mint: "#173B38",
    sky: "#173543",
    lavender: "#302A48",
  },
  status: {
    emergency: "#FF6F8E",
    emergencySoft: "#42202B",
    warning: "#FFD166",
    warningSoft: "#403621",
    success: realmColors.health,
    successSoft: "#173B38",
    ai: realmColors.medication,
    aiSoft: "#302A48",
    system: "#90A4B4",
    systemSoft: "#1B2D3B",
  },
} as const;

export const darkColors = {
  ...sharedColors,
  background: {
    app: "#081118",
    mist: "#0E1821",
    elevated: "#111E29",
    warm: "#152533",
    canvas: "#081118",
    canvasSecondary: "#0E1821",
  },
  surface: {
    primary: "#111E29",
    secondary: "#152533",
    tertiary: "#1B2D3B",
    glass: "rgba(255,255,255,0.075)",
    glassStrong: "rgba(255,255,255,0.12)",
  },
  border: {
    soft: "rgba(255,255,255,0.10)",
    strong: "rgba(255,255,255,0.17)",
  },
  text: {
    primary: "#F5FBFF",
    secondary: "#90A4B4",
    muted: "#617282",
    inverse: "#061016",
  },
  card: {
    background: "#111E29",
    border: "rgba(255,255,255,0.10)",
  },
} as const;

export const lightColors = {
  ...sharedColors,
  brand: {
    primary: "#238B72",
    primarySoft: "#DDF7EE",
    secondary: "#257FA1",
    secondarySoft: "#DDF4FC",
  },
  accent: {
    coral: "#C94362",
    peach: "#FBE8E6",
    mint: "#DDF7EE",
    sky: "#DDF4FC",
    lavender: "#EEE9FA",
  },
  status: {
    emergency: "#C94362",
    emergencySoft: "#FBE8E6",
    warning: "#9A7018",
    warningSoft: "#FFF1C8",
    success: "#238B72",
    successSoft: "#DDF7EE",
    ai: "#765AC5",
    aiSoft: "#EEE9FA",
    system: "#62747D",
    systemSoft: "#EDF3F1",
  },
  background: {
    app: "#EDF7F4",
    mist: "#F3F8F6",
    elevated: "#FFFFFF",
    warm: "#F8FBFA",
    canvas: "#EDF7F4",
    canvasSecondary: "#F8FBFA",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F3F8F6",
    tertiary: "#EDF3F1",
    glass: "rgba(255,255,255,0.82)",
    glassStrong: "rgba(255,255,255,0.95)",
  },
  border: {
    soft: "rgba(14,34,43,0.08)",
    strong: "rgba(14,34,43,0.13)",
  },
  text: {
    primary: "#132127",
    secondary: "#62747D",
    muted: "#88959B",
    inverse: "#FFFFFF",
  },
  card: {
    background: "#FFFFFF",
    border: "rgba(14,34,43,0.08)",
  },
} as const;

export type ThemeMode = "dark" | "light";
export type HealthColors = typeof darkColors | typeof lightColors;
export type RealmName = keyof typeof realmColors;

export const typography = {
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    lineHeight: 14,
  },
  caption: { fontSize: 11, fontWeight: "700", lineHeight: 15 },
  bodySmall: { fontSize: 12, fontWeight: "500", lineHeight: 17 },
  body: { fontSize: 13, fontWeight: "500", lineHeight: 19 },
  label: { fontSize: 13, fontWeight: "800", lineHeight: 17 },
  sectionTitle: { fontSize: 16, fontWeight: "800", lineHeight: 20 },
  cardTitle: { fontSize: 16, fontWeight: "800", lineHeight: 20 },
  screenTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.9, lineHeight: 26 },
  heroTitle: { fontSize: 27, fontWeight: "900", letterSpacing: -1, lineHeight: 29 },
  metric: { fontSize: 25, fontWeight: "900", letterSpacing: -0.9, lineHeight: 28 },
  display: { fontSize: 32, fontWeight: "900", letterSpacing: -1.2, lineHeight: 33 },
} as const;

export const elevations = {
  none: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 3,
  },
  soft: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 4,
  },
  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 8,
  },
} as const;

export const darkTheme = {
  mode: "dark",
  colors: darkColors,
  typography,
  elevations,
} as const;

export const lightTheme = {
  mode: "light",
  colors: lightColors,
  typography,
  elevations,
} as const;

export type HealthTheme = typeof darkTheme | typeof lightTheme;

export function getHealthTheme(mode: ThemeMode | null | undefined): HealthTheme {
  return mode === "light" ? lightTheme : darkTheme;
}

export function useHealthTheme(): HealthTheme {
  return getHealthTheme(useColorScheme());
}

// Compatibility aliases for existing screens. New primitives should use
// useHealthTheme() so they respond to the active system appearance.
export const colors = lightColors;
export const shadows = elevations;

export const gradients = {
  appBackground: [darkColors.background.app, darkColors.background.mist],
  healthPrimary: [darkColors.brand.primarySoft, darkColors.accent.sky],
  familyCare: [darkColors.accent.mint, darkColors.accent.lavender],
  friendlyMoment: [darkColors.accent.peach, darkColors.background.warm],
  ai: [darkColors.status.aiSoft, darkColors.accent.sky],
} as const;

export const theme = darkTheme;
