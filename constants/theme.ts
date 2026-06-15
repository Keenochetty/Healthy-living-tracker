export const colors = {
  background: {
    app: "#FAF8F4",
    mist: "#F5F8FB",
    elevated: "#FFFFFF",
    warm: "#FFFDF8",
  },
  border: {
    soft: "#E3E8EF",
    strong: "#C8D2DC",
  },
  brand: {
    primary: "#256D7B",
    primarySoft: "#DDF4F2",
    secondary: "#6D5BD0",
    secondarySoft: "#EEE7FF",
  },
  accent: {
    coral: "#F46F5D",
    peach: "#FFE7DA",
    mint: "#D9F4E8",
    sky: "#DCEEFF",
    lavender: "#EEE7FF",
  },
  status: {
    emergency: "#B42318",
    emergencySoft: "#FFE4E6",
    warning: "#B7791F",
    warningSoft: "#FFF3D6",
    success: "#2E7D5B",
    successSoft: "#D9F4E8",
    ai: "#6D5BD0",
    aiSoft: "#EEE7FF",
    system: "#667085",
    systemSoft: "#EEF2F6",
  },
  text: {
    primary: "#17212B",
    secondary: "#475467",
    muted: "#667085",
    inverse: "#FFFFFF",
  },
  card: {
    background: "#FFFFFF",
    border: "#E6EAF0",
  },
} as const;

export const gradients = {
  appBackground: [colors.background.warm, colors.background.mist],
  healthPrimary: [colors.brand.primarySoft, colors.accent.sky],
  familyCare: [colors.accent.mint, colors.accent.lavender],
  friendlyMoment: [colors.accent.peach, colors.background.warm],
  ai: [colors.status.aiSoft, colors.accent.sky],
} as const;

export const shadows = {
  card: {
    shadowColor: "#1D3B45",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },
  soft: {
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  gradients,
  shadows,
} as const;
