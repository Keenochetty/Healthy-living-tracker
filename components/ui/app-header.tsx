import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type AppHeaderProps = {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
};

export function AppHeader({ action, eyebrow, subtitle, title }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignSelf: "flex-start"
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between"
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase"
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 15,
    lineHeight: 21
  },
  title: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0
  }
});
