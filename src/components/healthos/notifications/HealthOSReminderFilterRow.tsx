import { ScrollView, StyleSheet } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";
import type { HealthOSReminderFilterKey } from "@/features/reminders";

const FILTERS: { key: HealthOSReminderFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due", label: "Due" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "scheduled", label: "Scheduled" },
  { key: "needs_review", label: "Needs review" },
  { key: "history", label: "History" },
];

type Props = {
  activeFilter: HealthOSReminderFilterKey;
  onChange: (filter: HealthOSReminderFilterKey) => void;
};

export function HealthOSReminderFilterRow({ activeFilter, onChange }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.row} horizontal showsHorizontalScrollIndicator={false}>
      {FILTERS.map((filter) => (
        <HealthOSPill
          key={filter.key}
          label={filter.label}
          onPress={() => onChange(filter.key)}
          selected={activeFilter === filter.key}
          size="sm"
          variant="glass"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});
