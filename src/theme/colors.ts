import { healthLightTheme, healthRealmAccents } from "./healthTheme";

export const appColors = {
  background: healthLightTheme.background,
  surface: "#ffffff",
  surfaceWarm: healthLightTheme.surfaceSoft,
  surfaceElevated: healthLightTheme.surfaceRaised,
  primary: healthLightTheme.primary,
  primarySoft: healthLightTheme.accent,
  secondary: healthLightTheme.secondaryForeground,
  secondarySoft: healthLightTheme.secondary,
  accent: healthLightTheme.primary,
  accentSoft: healthLightTheme.accent,
  warning: "#fbbf24",
  warningSoft: "#fef3c7",
  success: "#34d399",
  successSoft: "#dcfce7",
  error: healthLightTheme.destructive,
  errorSoft: "#ffe4e6",
  text: healthLightTheme.foreground,
  textSecondary: healthLightTheme.mutedForeground,
  textMuted: healthLightTheme.mutedForeground,
  border: healthLightTheme.border,
  glassBackground: healthLightTheme.surfaceGlass,
  glassBorder: "rgba(255, 255, 255, 0.56)",
  glassShadow: "rgba(39, 33, 31, 0.14)",
  nav: "rgba(12, 18, 25, 0.92)",
  navActive: "rgba(255, 246, 236, 0.96)",
  navInactive: "rgba(255,255,255,0.78)",
  navText: "#f8fafc",
  navActiveText: "#1d1918",
  navBorder: "rgba(255, 255, 255, 0.18)",
  navShadow: "rgba(0, 0, 0, 0.34)",
  locked: "#7c3aed",
  lockedSoft: "#f3e8ff",
  emergency: "#be123c"
} as const;

export const realmColors = {
  nutrition: healthRealmAccents.food,
  workout: healthRealmAccents.fitness,
  biometrics: healthRealmAccents.health,
  device_sync: "#38bdf8",
  medication: healthRealmAccents.meds,
  supplements: healthRealmAccents.meds,
  records: healthRealmAccents.records,
  calendar: healthRealmAccents.family,
  womens_health: healthRealmAccents.women,
  pregnancy: healthRealmAccents.women,
  baby_child: healthRealmAccents.baby,
  mens_health: "#60a5fa",
  family: healthRealmAccents.family,
  ai_assistant: healthRealmAccents.health
} as const;

export const statusColors = {
  success: appColors.success,
  warning: appColors.warning,
  error: appColors.error,
  review: "#c084fc",
  private: appColors.locked,
  shared: "#0f766e",
  locked: appColors.locked,
  neutral: appColors.textMuted
} as const;
