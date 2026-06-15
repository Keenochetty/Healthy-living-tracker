export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  "2xl": 28,
  "3xl": 34,
  full: 999,
} as const;

export const componentRadius = {
  card: radius["2xl"],
  widget: radius["2xl"],
  button: radius.lg,
  chip: radius.full,
  avatar: radius.full,
  input: radius.md,
  bottomSheet: radius["3xl"],
} as const;
