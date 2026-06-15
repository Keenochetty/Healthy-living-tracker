import type { ViewStyle } from "react-native";

export const healthRealmAccents = {
  health: "hsl(174, 58%, 34%)",
  fitness: "hsl(216, 90%, 56%)",
  food: "hsl(32, 92%, 55%)",
  women: "hsl(340, 76%, 62%)",
  baby: "hsl(198, 82%, 62%)",
  family: "hsl(39, 88%, 56%)",
  records: "hsl(262, 64%, 58%)",
  meds: "hsl(252, 72%, 64%)"
} as const;

export const healthLightTheme = {
  background: "hsl(42, 42%, 97%)",
  foreground: "hsl(222, 34%, 12%)",
  card: "#ffffff",
  cardForeground: "hsl(222, 34%, 12%)",
  popover: "#ffffff",
  popoverForeground: "hsl(222, 34%, 12%)",
  primary: "hsl(174, 58%, 34%)",
  primaryForeground: "#ffffff",
  secondary: "hsl(214, 32%, 92%)",
  secondaryForeground: "hsl(222, 28%, 18%)",
  muted: "hsl(218, 28%, 94%)",
  mutedForeground: "hsl(220, 12%, 44%)",
  accent: "hsl(174, 42%, 91%)",
  accentForeground: "hsl(174, 58%, 22%)",
  destructive: "hsl(0, 72%, 51%)",
  destructiveForeground: "#ffffff",
  border: "hsl(220, 24%, 88%)",
  input: "hsl(220, 24%, 88%)",
  ring: "hsl(174, 58%, 34%)",
  surfaceSoft: "hsl(42, 48%, 96%)",
  surfaceRaised: "#ffffff",
  surfaceGlass: "rgba(255, 255, 255, 0.74)"
} as const;

export const healthDarkTheme = {
  background: "hsl(222, 38%, 7%)",
  foreground: "hsl(210, 35%, 96%)",
  card: "hsl(222, 32%, 10%)",
  cardForeground: "hsl(210, 35%, 96%)",
  popover: "hsl(222, 32%, 10%)",
  popoverForeground: "hsl(210, 35%, 96%)",
  primary: "hsl(174, 62%, 48%)",
  primaryForeground: "hsl(222, 38%, 7%)",
  secondary: "hsl(220, 24%, 16%)",
  secondaryForeground: "hsl(210, 35%, 92%)",
  muted: "hsl(220, 22%, 14%)",
  mutedForeground: "hsl(215, 16%, 68%)",
  accent: "hsl(174, 42%, 16%)",
  accentForeground: "hsl(174, 62%, 76%)",
  destructive: "hsl(0, 72%, 58%)",
  destructiveForeground: "#ffffff",
  border: "hsl(220, 20%, 18%)",
  input: "hsl(220, 20%, 18%)",
  ring: "hsl(174, 62%, 48%)",
  surfaceSoft: "hsl(222, 38%, 7%)",
  surfaceRaised: "hsl(222, 32%, 10%)",
  surfaceGlass: "rgba(18, 23, 34, 0.76)"
} as const;

export type HealthColorTheme = {
  [Key in keyof typeof healthLightTheme]: string;
};

export const healthRadius = {
  card: 22,
  panel: 28,
  pill: 999
} as const;

export const healthShadows = {
  soft: {
    elevation: 5,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 23
  } satisfies ViewStyle,
  card: {
    elevation: 3,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 15
  } satisfies ViewStyle,
  floating: {
    elevation: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.14,
    shadowRadius: 33
  } satisfies ViewStyle
} as const;

export const healthDarkShadows = {
  soft: {
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 23
  } satisfies ViewStyle,
  card: {
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 15
  } satisfies ViewStyle,
  floating: {
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.34,
    shadowRadius: 33
  } satisfies ViewStyle
} as const;

export function realmAccentWithOpacity(accent: keyof typeof healthRealmAccents, opacity = 0.12) {
  const hsl = healthRealmAccents[accent].replace("hsl(", "").replace(")", "");
  return `hsla(${hsl}, ${opacity})`;
}
