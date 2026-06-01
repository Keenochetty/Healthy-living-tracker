import { StyleSheet, Text, View } from "react-native";

import { AppIcon, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type TeenTransitionCardProps = {
  onOpenSettings?: () => void;
};

export function TeenTransitionCard({ onOpenSettings }: TeenTransitionCardProps) {
  return (
    <WidgetCard
      accentColor={colors.status.ai}
      action={<StatusPill label="Ages 13-17" tone="ai" />}
      subtitle="Teen profiles use gradual transition controls before adult-controlled privacy begins."
      title="Teen transition"
    >
      <View style={styles.body}>
        <View style={styles.iconShell}>
          <AppIcon color={colors.status.ai} name="profiles" size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Limited sharing placeholder</Text>
          <Text style={styles.text}>Teen access can later separate shared schedules, emergency info, and sensitive health details.</Text>
        </View>
      </View>
      <QuickActionButton label="Transition settings placeholder" onPress={onOpenSettings ?? (() => undefined)} toneColor={colors.status.ai} />
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.status.aiSoft,
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  text: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900"
  }
});
