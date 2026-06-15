export const appShadows = {
  card: {
    elevation: 3,
    shadowColor: "#2f261f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  floating: {
    elevation: 10,
    shadowColor: "#2f261f",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
} as const;
