import type { ReactNode } from "react";
import { Text, View, type TextStyle, type ViewStyle } from "react-native";

import { spacing } from "@/constants/spacing";
import { typography, useHealthTheme } from "@/constants/theme";

type AppHeaderProps = {
  action?: ReactNode;
  compact?: boolean;
  eyebrow?: string;
  subtitle?: string;
  title: string;
};

export function AppHeader({
  action,
  compact = false,
  eyebrow,
  subtitle,
  title,
}: AppHeaderProps) {
  const { colors } = useHealthTheme();

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.text.muted }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={[
            compact ? styles.compactTitle : styles.title,
            { color: colors.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = {
  action: {
    alignSelf: "flex-start",
  } satisfies ViewStyle,
  compactTitle: {
    ...typography.sectionTitle,
  } satisfies TextStyle,
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  } satisfies ViewStyle,
  copy: {
    flex: 1,
    gap: spacing.xs,
  } satisfies ViewStyle,
  eyebrow: {
    ...typography.kicker,
    textTransform: "uppercase",
  } satisfies TextStyle,
  subtitle: {
    ...typography.body,
  } satisfies TextStyle,
  title: {
    ...typography.screenTitle,
  } satisfies TextStyle,
};
