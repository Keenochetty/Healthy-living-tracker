import { fontSizes, getTheme, radius, spacing, themes } from "@/theme/tokens";
import type { UserThemeKey } from "@/types/profile";

export type UserThemeOption = {
  background: string;
  description: string;
  key: UserThemeKey;
  name: string;
  primary: string;
  soft: string;
  textOnPrimary: string;
};

export const USER_THEMES: UserThemeOption[] = [
  {
    background: themes.soft_lavender.background,
    description: "Neutral placeholder light theme",
    key: "soft_lavender",
    name: "Neutral Light A",
    primary: themes.soft_lavender.primary,
    soft: themes.soft_lavender.primarySoft,
    textOnPrimary: "#ffffff",
  },
  {
    background: themes.zest_green.background,
    description: "Neutral placeholder light theme",
    key: "zest_green",
    name: "Neutral Light B",
    primary: themes.zest_green.primary,
    soft: themes.zest_green.primarySoft,
    textOnPrimary: "#ffffff",
  },
  {
    background: themes.peach_parenting.background,
    description: "Neutral placeholder light theme",
    key: "peach_parenting",
    name: "Neutral Light C",
    primary: themes.peach_parenting.primary,
    soft: themes.peach_parenting.primarySoft,
    textOnPrimary: "#ffffff",
  },
  {
    background: themes.clean_blue.background,
    description: "Neutral placeholder light theme",
    key: "clean_blue",
    name: "Neutral Light",
    primary: themes.clean_blue.primary,
    soft: themes.clean_blue.primarySoft,
    textOnPrimary: "#ffffff",
  },
  {
    background: themes.calm_dark.background,
    description: "Neutral placeholder dark theme",
    key: "calm_dark",
    name: "Neutral Dark",
    primary: themes.calm_dark.primary,
    soft: themes.calm_dark.primarySoft,
    textOnPrimary: "#0f172a",
  },
  {
    background: themes.premium_dark_health.background,
    description: "Neutral placeholder dark theme",
    key: "premium_dark_health",
    name: "Neutral Dark A",
    primary: themes.premium_dark_health.primary,
    soft: themes.premium_dark_health.primarySoft,
    textOnPrimary: "#171b22",
  },
];

export function getUserTheme(themeKey: UserThemeKey) {
  return USER_THEMES.find((theme) => theme.key === themeKey) ?? USER_THEMES[0];
}

export const theme = {
  colors: {
    background: getTheme("soft_lavender").background,
    border: getTheme("soft_lavender").border,
    card: getTheme("soft_lavender").surface,
    mutedText: getTheme("soft_lavender").mutedText,
    primary: getTheme("soft_lavender").primary,
    primarySoft: getTheme("soft_lavender").primarySoft,
    secondary: getTheme("soft_lavender").secondary,
    text: getTheme("soft_lavender").text,
    warning: getTheme("soft_lavender").warning,
    warningSoft: "#fff7ed",
  },
  radius: {
    button: radius.md,
    card: radius.xl,
    pill: radius.full,
  },
  spacing: {
    lg: spacing.lg,
    md: spacing.md,
    sm: spacing.sm,
    xl: spacing["2xl"],
    xs: spacing.xs,
  },
  fontSizes: {
    ...fontSizes,
  },
};

export const themeDirection = {
  description: "Neutral temporary foundation awaiting the next design pass.",
  name: "Blank native foundation",
} as const;
