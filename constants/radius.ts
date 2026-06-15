export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  "2xl": 24,
  "3xl": 30,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;

export const componentRadius = {
  card: radius.xl,
  compactCard: 19,
  widget: radius.xl,
  hero: radius["3xl"],
  button: 16,
  chip: radius.full,
  avatar: 16,
  avatarRound: radius.full,
  iconButton: 15,
  input: 17,
  bottomSheet: 32,
  bottomNav: 28,
  aiBar: 22,
} as const;
