export const colors = {
  background: {
    app: "#F3F5F1",
    mist: "#EFF4EE",
    elevated: "#FFFFFF",
    warm: "#FBFAF4"
  },
  border: {
    soft: "#DDE5DC",
    strong: "#AAB8AA"
  },
  brand: {
    primary: "#16461D",
    primarySoft: "#DDEDDD",
    secondary: "#77927A",
    secondarySoft: "#E8EFE7"
  },
  accent: {
    coral: "#C66A57",
    peach: "#F6E8DB",
    mint: "#DDEDDD",
    sky: "#E4EEF3",
    lavender: "#EEE7FF"
  },
  status: {
    emergency: "#B42318",
    emergencySoft: "#FFE4E6",
    warning: "#9A6B22",
    warningSoft: "#F6EAC8",
    success: "#16461D",
    successSoft: "#DDEDDD",
    ai: "#6D5BD0",
    aiSoft: "#EEE7FF",
    system: "#66706A",
    systemSoft: "#EEF1ED"
  },
  text: {
    primary: "#0A1D0E",
    secondary: "#3F4B42",
    muted: "#66706A",
    inverse: "#FFFFFF"
  },
  card: {
    background: "#FFFFFF",
    border: "#DDE5DC"
  }
} as const;

export const gradients = {
  appBackground: [colors.background.warm, colors.background.mist],
  healthPrimary: [colors.brand.primarySoft, colors.accent.sky],
  familyCare: [colors.accent.mint, colors.accent.lavender],
  friendlyMoment: [colors.accent.peach, colors.background.warm],
  ai: [colors.status.aiSoft, colors.accent.sky]
} as const;

export const shadows = {
  card: {
    shadowColor: "#0A1D0E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 34,
    elevation: 4
  },
  soft: {
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 3
  }
} as const;

export const theme = {
  colors,
  gradients,
  shadows
} as const;
