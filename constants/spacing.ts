import { layout } from "@/constants/layout";

export const spacing = {
  none: 0,
  "2xs": 2,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  "2xl": 18,
  "3xl": 24,
  "4xl": 32,
  "5xl": 40,
  "6xl": 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export const layoutSpacing = {
  screenPadding: spacing["2xl"],
  compactScreenPadding: spacing.lg,
  sectionGap: spacing["2xl"],
  cardGap: spacing.md,
  chipGap: spacing.sm,
  touchTarget: layout.minTapTarget,
  bottomSheetHandleWidth: 42,
} as const;
