import { Text, View } from "react-native";

import { fontSizes, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppButton } from "./AppButton";

type AppEmptyStateProps = {
  actionLabel?: string;
  description: string;
  emoji: string;
  onActionPress?: () => void;
  title: string;
};

export function AppEmptyState({
  actionLabel,
  description,
  emoji,
  onActionPress,
  title,
}: AppEmptyStateProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing["2xl"],
      }}
    >
      <Text style={{ fontSize: 36 }}>{emoji}</Text>
      <View style={{ alignItems: "center", gap: spacing.xs }}>
        <Text
          style={{
            color: theme.text,
            fontSize: fontSizes.lg,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.mutedText,
            lineHeight: 21,
            textAlign: "center",
          }}
        >
          {description}
        </Text>
      </View>
      {actionLabel && onActionPress ? (
        <AppButton title={actionLabel} onPress={onActionPress} size="sm" />
      ) : null}
    </View>
  );
}
