import { StyleSheet, Text, View } from "react-native";

import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type EmptyStateProps = {
  icon?: AppIconName;
  message: string;
  title: string;
};

export function NativeEmptyState({ icon = "notifications", message, title }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconShell}>
        <AppIcon color={colors.brand.primary} name={icon} size={26} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function NativeSkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonLine, styles.skeletonShort]} />
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonMedium]} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 160,
    padding: spacing["2xl"]
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.brand.primarySoft,
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  message: {
    color: colors.text.muted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 360,
    textAlign: "center"
  },
  skeletonCard: {
    backgroundColor: colors.background.mist,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  skeletonLine: {
    backgroundColor: colors.border.soft,
    borderRadius: 999,
    height: 14,
    opacity: 0.75,
    width: "100%"
  },
  skeletonMedium: {
    width: "68%"
  },
  skeletonShort: {
    height: 18,
    width: "38%"
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  }
});
