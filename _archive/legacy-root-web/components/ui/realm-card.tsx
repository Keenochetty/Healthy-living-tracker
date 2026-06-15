import { Pressable, Text, View } from "react-native";

import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import {
  realmColors,
  type RealmName,
  typography,
  useHealthTheme,
} from "@/constants/theme";

type RealmCardProps = {
  icon: AppIconName;
  label: string;
  meta?: string;
  onPress?: () => void;
  realm: RealmName;
};

export function RealmCard({
  icon,
  label,
  meta,
  onPress,
  realm,
}: RealmCardProps) {
  const { colors } = useHealthTheme();
  const accent = realmColors[realm];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface.glassStrong,
        borderColor: colors.border.soft,
        borderRadius: componentRadius.compactCard,
        borderWidth: 1,
        gap: spacing.sm,
        minHeight: 88,
        opacity: pressed ? 0.82 : 1,
        padding: spacing.lg,
      })}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: `${accent}2E`,
          borderRadius: 12,
          height: 32,
          justifyContent: "center",
          width: 32,
        }}
      >
        <AppIcon color={accent} name={icon} size={17} variant="filled" />
      </View>
      <Text style={{ color: colors.text.primary, ...typography.label }}>
        {label}
      </Text>
      {meta ? (
        <Text style={{ color: colors.text.secondary, ...typography.caption }}>
          {meta}
        </Text>
      ) : null}
    </Pressable>
  );
}
