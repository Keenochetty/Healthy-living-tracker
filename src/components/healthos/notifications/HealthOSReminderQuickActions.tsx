import { StyleSheet, View } from "react-native";
import { BellPlus, CalendarClock, ShieldCheck } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

type Props = {
  onAddReminder: () => void;
  onOpenSchedule: () => void;
  onPrivacy: () => void;
};

export function HealthOSReminderQuickActions({
  onAddReminder,
  onOpenSchedule,
  onPrivacy,
}: Props) {
  return (
    <HealthOSCard title="Quick actions" subtitle="Use review-first actions. Nothing medical is scheduled silently." variant="compact">
      <View style={styles.row}>
        <HealthOSPill icon={<BellPlus size={14} />} label="Review new" onPress={onAddReminder} variant="active" />
        <HealthOSPill icon={<CalendarClock size={14} />} label="Schedule" onPress={onOpenSchedule} variant="glass" />
        <HealthOSPill icon={<ShieldCheck size={14} />} label="Privacy rules" onPress={onPrivacy} variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
