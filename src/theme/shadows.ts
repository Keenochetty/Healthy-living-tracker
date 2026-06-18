export const appShadows = {
  card: {
    elevation: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  floating: {
    elevation: 6,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
} as const;
