import { layout } from "@/constants/layout";

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const layoutSpacing = {
  screenPadding: spacing["2xl"],
  sectionGap: spacing["2xl"],
  cardGap: spacing.lg,
  chipGap: spacing.sm,
  touchTarget: layout.minTapTarget,
  bottomSheetHandleWidth: 44,
} as const;
