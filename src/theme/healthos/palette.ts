export type HealthOSColorMode = "dark" | "light";

export type HealthOSPalette = {
  // Primary app white used for shimmer surfaces, cards, and high-emphasis light UI.
  shimmerWhite: string;
  // Brand action blue used for primary actions, links, AI search highlights, and chart focus.
  skyBlue: string;
  // Main dark-mode foundation used for backgrounds, nav, and premium dark cards.
  deepNavy: string;
  // Light-mode app background used behind cards and scroll views.
  mistBackground: string;
  // Light frosted panels used for widgets, menus, and translucent overlays.
  glassWhite: string;
  // Dark frosted panels used for widgets, menus, and translucent overlays.
  glassDark: string;
  // Primary text used on normal surfaces.
  inkText: string;
  // Secondary text used for labels, helper text, captions, and low-emphasis metadata.
  softText: string;
  // Subtle border used for card outlines, dividers, fields, and menu separators.
  borderSubtle: string;
  // Success state used for completion, safe health status, and positive trends.
  success: string;
  // Warning state used for attention, upcoming medication, and incomplete setup.
  warning: string;
  // Danger state used for destructive actions, critical health flags, and errors.
  danger: string;
  // Nutrition realm accent used for food, recipes, meal plans, and macro charts.
  nutrition: string;
  // Fitness realm accent used for workouts, muscle maps, rings, and activity plans.
  fitness: string;
  // Medication realm accent used for medication, supplements, adherence, and schedules.
  medication: string;
  // Women's health realm accent used for cycle tracking and related privacy surfaces.
  women: string;
  // Pregnancy realm accent used for pregnancy progress and related timelines.
  pregnancy: string;
  // Baby/child realm accent used for baby logs, child profiles, and growth summaries.
  baby: string;
  // Records realm accent used for documents, labs, prescriptions, and imports.
  records: string;
  // Family realm accent used for Circle, profiles, sharing, and caregiver context.
  family: string;
  // AI accent used for assistant prompts, import previews, and smart suggestions.
  ai: string;
};

export const healthOSLightPalette: HealthOSPalette = {
  shimmerWhite: "#ffffff",
  skyBlue: "#38bdf8",
  deepNavy: "#07111f",
  mistBackground: "#f6f9fc",
  glassWhite: "rgba(255, 255, 255, 0.82)",
  glassDark: "rgba(7, 17, 31, 0.72)",
  inkText: "#0f172a",
  softText: "#64748b",
  borderSubtle: "rgba(148, 163, 184, 0.28)",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  nutrition: "#f59e0b",
  fitness: "#2563eb",
  medication: "#8b5cf6",
  women: "#db2777",
  pregnancy: "#ec4899",
  baby: "#0ea5e9",
  records: "#6366f1",
  family: "#14b8a6",
  ai: "#38bdf8",
};

export const healthOSDarkPalette: HealthOSPalette = {
  shimmerWhite: "#f8fafc",
  skyBlue: "#7dd3fc",
  deepNavy: "#020617",
  mistBackground: "#07111f",
  glassWhite: "rgba(248, 250, 252, 0.12)",
  glassDark: "rgba(15, 23, 42, 0.78)",
  inkText: "#f8fafc",
  softText: "#94a3b8",
  borderSubtle: "rgba(148, 163, 184, 0.2)",
  success: "#86efac",
  warning: "#fbbf24",
  danger: "#f87171",
  nutrition: "#fbbf24",
  fitness: "#60a5fa",
  medication: "#a78bfa",
  women: "#f472b6",
  pregnancy: "#fb7185",
  baby: "#38bdf8",
  records: "#818cf8",
  family: "#5eead4",
  ai: "#7dd3fc",
};

export const healthOSPalettes = {
  dark: healthOSDarkPalette,
  light: healthOSLightPalette,
} as const;

export const healthOSPalette = healthOSPalettes;

export function getHealthOSPalette(mode: HealthOSColorMode = "light") {
  return healthOSPalettes[mode];
}
