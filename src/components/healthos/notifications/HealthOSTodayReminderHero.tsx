import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Clock3 } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSTodayReminderSummary } from "@/features/reminders";

type Props = {
  summary: HealthOSTodayReminderSummary;
};

export function HealthOSTodayReminderHero({ summary }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={<Clock3 color="#f8fafc" size={22} />}
      subtitle={summary.nextItem ? `Next: ${summary.nextItem.title} at ${summary.nextItem.dueLabel}` : "No active reminder due today."}
      title="Today"
      variant="darkHero"
    >
      <View style={styles.metrics}>
        <Metric label="Today" value={summary.totalCount} />
        <Metric label="Due" value={summary.dueCount} />
        <Metric label="Done" value={summary.completedCount} />
      </View>
      {summary.overdueCount ? (
        <HealthOSPill label={`${summary.overdueCount} needs attention`} size="sm" variant="danger" />
      ) : (
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Sensitive notification details remain private on the lock screen by default.
        </Text>
      )}
    </HealthOSCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={[healthOSTypography.statNumber, styles.metricValue]}>{value}</Text>
      <Text style={[healthOSTypography.caption, styles.metricLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  metricLabel: {
    color: "#cbd5e1",
  },
  metrics: {
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  metricValue: {
    color: "#f8fafc",
  },
});
