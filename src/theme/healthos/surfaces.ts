import type { ViewStyle } from "react-native";

import { getHealthOSPalette, type HealthOSColorMode } from "./palette";
import { healthOSBorderWidth, healthOSRadius, healthOSSpacing } from "./tokens";

export type HealthOSSurfaceName =
  | "accordionSurface"
  | "aiSurface"
  | "appBackground"
  | "compactCard"
  | "dangerSurface"
  | "darkHeroCard"
  | "elevatedCard"
  | "frostedWidget"
  | "glassMenu"
  | "glassPanel"
  | "glassPill"
  | "listRow"
  | "screenSurface";

export function createHealthOSSurfaces(mode: HealthOSColorMode = "light") {
  const palette = getHealthOSPalette(mode);
  const isDark = mode === "dark";

  return {
    appBackground: {
      backgroundColor: isDark ? palette.deepNavy : palette.mistBackground,
      flex: 1,
    },
    screenSurface: {
      backgroundColor: isDark ? palette.deepNavy : palette.mistBackground,
      flex: 1,
    },
    elevatedCard: {
      backgroundColor: isDark ? "#0f172a" : palette.shimmerWhite,
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.xl,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.lg,
      shadowColor: isDark ? "#000000" : "#0f172a",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.24 : 0.08,
      shadowRadius: 24,
      elevation: 3,
    },
    compactCard: {
      backgroundColor: isDark ? "#0f172a" : palette.shimmerWhite,
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.lg,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.md,
    },
    glassPanel: {
      backgroundColor: isDark ? palette.glassDark : palette.glassWhite,
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius["2xl"],
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.lg,
    },
    glassPill: {
      backgroundColor: isDark ? palette.glassDark : palette.glassWhite,
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.pill,
      borderWidth: healthOSBorderWidth.thin,
      paddingHorizontal: healthOSSpacing.md,
      paddingVertical: healthOSSpacing.sm,
    },
    glassMenu: {
      backgroundColor: isDark ? palette.glassDark : palette.glassWhite,
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.xl,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.sm,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: isDark ? 0.32 : 0.12,
      shadowRadius: 28,
      elevation: 8,
    },
    frostedWidget: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.78)",
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.xl,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.lg,
    },
    darkHeroCard: {
      backgroundColor: palette.deepNavy,
      borderColor: isDark ? palette.borderSubtle : "rgba(56, 189, 248, 0.22)",
      borderRadius: healthOSRadius["2xl"],
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.xl,
    },
    listRow: {
      backgroundColor: isDark ? "#0f172a" : palette.shimmerWhite,
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.md,
      borderWidth: healthOSBorderWidth.thin,
      minHeight: 56,
      paddingHorizontal: healthOSSpacing.md,
      paddingVertical: healthOSSpacing.sm,
    },
    accordionSurface: {
      backgroundColor: isDark ? "#0b1220" : "#ffffff",
      borderColor: palette.borderSubtle,
      borderRadius: healthOSRadius.lg,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.md,
    },
    dangerSurface: {
      backgroundColor: isDark ? "rgba(248, 113, 113, 0.12)" : "rgba(220, 38, 38, 0.08)",
      borderColor: isDark ? "rgba(248, 113, 113, 0.32)" : "rgba(220, 38, 38, 0.22)",
      borderRadius: healthOSRadius.lg,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.lg,
    },
    aiSurface: {
      backgroundColor: isDark ? "rgba(56, 189, 248, 0.12)" : "rgba(56, 189, 248, 0.1)",
      borderColor: isDark ? "rgba(125, 211, 252, 0.3)" : "rgba(56, 189, 248, 0.24)",
      borderRadius: healthOSRadius.xl,
      borderWidth: healthOSBorderWidth.thin,
      padding: healthOSSpacing.lg,
    },
  } satisfies Record<HealthOSSurfaceName, ViewStyle>;
}

export const healthOSLightSurfaces = createHealthOSSurfaces("light");
export const healthOSDarkSurfaces = createHealthOSSurfaces("dark");

export const healthOSSurfaces = {
  dark: healthOSDarkSurfaces,
  light: healthOSLightSurfaces,
} as const;

export function getHealthOSSurfaces(mode: HealthOSColorMode = "light") {
  return mode === "dark" ? healthOSDarkSurfaces : healthOSLightSurfaces;
}
