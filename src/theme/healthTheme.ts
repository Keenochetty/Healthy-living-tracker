import type { ViewStyle } from "react-native";

export const healthRealmAccents = {
  health: "hsl(215, 16%, 47%)",
  fitness: "hsl(215, 16%, 47%)",
  food: "hsl(215, 16%, 47%)",
  women: "hsl(215, 16%, 47%)",
  baby: "hsl(215, 16%, 47%)",
  family: "hsl(215, 16%, 47%)",
  records: "hsl(215, 16%, 47%)",
  meds: "hsl(215, 16%, 47%)",
} as const;

export const healthLightTheme = {
  background: "hsl(210, 40%, 98%)",
  foreground: "hsl(222, 47%, 11%)",
  card: "#ffffff",
  cardForeground: "hsl(222, 47%, 11%)",
  popover: "#ffffff",
  popoverForeground: "hsl(222, 47%, 11%)",
  primary: "hsl(215, 16%, 47%)",
  primaryForeground: "#ffffff",
  secondary: "hsl(210, 40%, 96%)",
  secondaryForeground: "hsl(222, 47%, 11%)",
  muted: "hsl(210, 40%, 96%)",
  mutedForeground: "hsl(215, 16%, 47%)",
  accent: "hsl(210, 40%, 96%)",
  accentForeground: "hsl(222, 47%, 11%)",
  destructive: "hsl(0, 72%, 51%)",
  destructiveForeground: "#ffffff",
  border: "hsl(214, 32%, 91%)",
  input: "hsl(214, 32%, 91%)",
  ring: "hsl(215, 16%, 47%)",
  surfaceSoft: "hsl(210, 40%, 96%)",
  surfaceRaised: "#ffffff",
  surfaceGlass: "rgba(255, 255, 255, 0.88)",
} as const;

export const healthDarkTheme = {
  background: "hsl(222, 38%, 7%)",
  foreground: "hsl(210, 35%, 96%)",
  card: "hsl(222, 32%, 10%)",
  cardForeground: "hsl(210, 35%, 96%)",
  popover: "hsl(222, 32%, 10%)",
  popoverForeground: "hsl(210, 35%, 96%)",
  primary: "hsl(215, 20%, 65%)",
  primaryForeground: "hsl(222, 38%, 7%)",
  secondary: "hsl(220, 24%, 16%)",
  secondaryForeground: "hsl(210, 35%, 92%)",
  muted: "hsl(220, 22%, 14%)",
  mutedForeground: "hsl(215, 16%, 68%)",
  accent: "hsl(220, 24%, 16%)",
  accentForeground: "hsl(210, 35%, 92%)",
  destructive: "hsl(0, 72%, 58%)",
  destructiveForeground: "#ffffff",
  border: "hsl(220, 20%, 18%)",
  input: "hsl(220, 20%, 18%)",
  ring: "hsl(215, 20%, 65%)",
  surfaceSoft: "hsl(222, 38%, 7%)",
  surfaceRaised: "hsl(222, 32%, 10%)",
  surfaceGlass: "rgba(15, 23, 42, 0.88)",
} as const;

export type HealthColorTheme = {
  [Key in keyof typeof healthLightTheme]: string;
};

export const healthRadius = {
  card: 20,
  panel: 24,
  pill: 999,
} as const;

export const healthShadows = {
  soft: {
    elevation: 5,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.04,
    shadowRadius: 23,
  } satisfies ViewStyle,
  card: {
    elevation: 3,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
  } satisfies ViewStyle,
  floating: {
    elevation: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 33,
  } satisfies ViewStyle,
} as const;

export const healthDarkShadows = {
  soft: {
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 23,
  } satisfies ViewStyle,
  card: {
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 15,
  } satisfies ViewStyle,
  floating: {
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.34,
    shadowRadius: 33,
  } satisfies ViewStyle,
} as const;

export function realmAccentWithOpacity(
  accent: keyof typeof healthRealmAccents,
  opacity = 0.12,
) {
  const hsl = healthRealmAccents[accent].replace("hsl(", "").replace(")", "");
  return `hsla(${hsl}, ${opacity})`;
}
