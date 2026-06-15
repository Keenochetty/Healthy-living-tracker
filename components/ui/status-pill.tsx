import { StyleSheet, Text, View } from "react-native";

import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type StatusTone = "ai" | "default" | "emergency" | "success" | "warning";

const toneStyles: Record<
  StatusTone,
  { backgroundColor: string; color: string }
> = {
  ai: { backgroundColor: colors.status.aiSoft, color: colors.status.ai },
  default: {
    backgroundColor: colors.status.systemSoft,
    color: colors.status.system,
  },
  emergency: {
    backgroundColor: colors.status.emergencySoft,
    color: colors.status.emergency,
  },
  success: {
    backgroundColor: colors.status.successSoft,
    color: colors.status.success,
  },
  warning: {
    backgroundColor: colors.status.warningSoft,
    color: colors.status.warning,
  },
};

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusPill({ label, tone = "default" }: StatusPillProps) {
  const token = toneStyles[tone];

  return (
    <View style={[styles.pill, { backgroundColor: token.backgroundColor }]}>
      <Text style={[styles.label, { color: token.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: componentRadius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
