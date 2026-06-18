import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  currentTrimester: HealthOSPregnancyData["currentTrimester"];
  currentWeek?: number;
  dueDate?: string;
  progress: HealthOSPregnancyData["progress"];
};

export function HealthOSDueDateProgressHero({
  currentTrimester,
  currentWeek,
  dueDate,
  progress,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      subtitle={dueDate ? `Estimated due date ${dueDate}` : "Add your due date to build your pregnancy timeline."}
      title={dueDate ? progress.status : "No due date yet"}
      variant="darkHero"
    >
      <View
        accessibilityLabel={progress.accessibleLabel}
        accessible
        style={styles.heroBody}
      >
        <HealthOSProgressRingPlaceholder
          label={dueDate ? "Pregnancy progress" : "No due date"}
          max={100}
          size={118}
          sublabel={dueDate ? `${progress.percent}% estimated` : "Timeline empty"}
          value={progress.percent}
        />
        <View style={styles.metrics}>
          <Metric label="Current week" value={currentWeek ? `Week ${currentWeek}` : "—"} />
          <Metric label="Trimester" value={currentTrimester === "unknown" ? "—" : formatValue(currentTrimester)} />
          <Metric
            label="Remaining"
            value={
              progress.weeksRemaining !== undefined
                ? `${progress.weeksRemaining} weeks`
                : progress.daysRemaining !== undefined
                  ? `${progress.daysRemaining} days`
                  : "—"
            }
          />
          <HealthOSPill
            label={dueDate ? "Private timeline" : "Add dates to begin"}
            realmColor={palette.pregnancy}
            size="sm"
            variant="realm"
          />
        </View>
      </View>
    </HealthOSCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <View style={styles.metric}>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>{label}</Text>
      <Text style={[healthOSTypography.cardTitle, { color: palette.shimmerWhite }]}>{value}</Text>
    </View>
  );
}

function formatValue(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  heroBody: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.lg,
  },
  metric: {
    gap: healthOSSpacing.xxs,
  },
  metrics: {
    flex: 1,
    gap: healthOSSpacing.sm,
  },
});
