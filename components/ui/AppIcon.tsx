import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

export const appIconNames = {
  activity: { filled: "walk", outline: "walk-outline" },
  ai: { filled: "sparkles", outline: "sparkles-outline" },
  calendar: { filled: "calendar", outline: "calendar-outline" },
  camera: { filled: "camera", outline: "camera-outline" },
  care: { filled: "shield-checkmark", outline: "shield-checkmark-outline" },
  caregiver: {
    filled: "shield-checkmark",
    outline: "shield-checkmark-outline",
  },
  chevron: { filled: "chevron-forward", outline: "chevron-forward" },
  child: { filled: "person-circle", outline: "person-circle-outline" },
  close: { filled: "close", outline: "close-outline" },
  doctor: { filled: "medical", outline: "medical-outline" },
  documents: { filled: "document-text", outline: "document-text-outline" },
  emergency: { filled: "call", outline: "call-outline" },
  family: { filled: "people", outline: "people-outline" },
  food: { filled: "restaurant", outline: "restaurant-outline" },
  home: { filled: "home", outline: "home-outline" },
  language: { filled: "language", outline: "language-outline" },
  lock: { filled: "lock-closed", outline: "lock-closed-outline" },
  medication: { filled: "medical", outline: "medical-outline" },
  mood: { filled: "happy", outline: "happy-outline" },
  more: { filled: "menu", outline: "menu-outline" },
  note: { filled: "document-text", outline: "document-text-outline" },
  notifications: { filled: "notifications", outline: "notifications-outline" },
  privacy: { filled: "lock-closed", outline: "lock-closed-outline" },
  profiles: { filled: "people", outline: "people-outline" },
  settings: { filled: "settings", outline: "settings-outline" },
  shield: { filled: "shield", outline: "shield-outline" },
  sleep: { filled: "moon", outline: "moon-outline" },
  sync: { filled: "sync", outline: "sync-outline" },
  units: { filled: "scale", outline: "scale-outline" },
  voice: { filled: "mic", outline: "mic-outline" },
} as const satisfies Record<string, Record<AppIconVariant, IoniconName>>;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type AppIconName = keyof typeof appIconNames;
export type AppIconVariant = "filled" | "outline";

type AppIconProps = {
  color: ColorValue;
  name: AppIconName;
  size?: number;
  variant?: AppIconVariant;
};

export function AppIcon({
  color,
  name,
  size = 22,
  variant = "outline",
}: AppIconProps) {
  return (
    <Ionicons color={color} name={appIconNames[name][variant]} size={size} />
  );
}
