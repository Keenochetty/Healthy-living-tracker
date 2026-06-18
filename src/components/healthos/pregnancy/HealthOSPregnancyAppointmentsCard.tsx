import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";
import type { PregnancyAppointment } from "@/types/pregnancy";

type Props = {
  appointments: PregnancyAppointment[];
  onAddAppointment: () => void;
  onAddReminder: () => void;
  onUploadRecord: () => void;
  onViewCalendar: () => void;
};

export function HealthOSPregnancyAppointmentsCard({
  appointments,
  onAddAppointment,
  onAddReminder,
  onUploadRecord,
  onViewCalendar,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const next = appointments.find((item) => new Date(item.scheduledAt).getTime() >= Date.now());

  return (
    <HealthOSCard subtitle="Appointments stay private unless you explicitly share them." title="Appointments and reminders" variant="elevated">
      <View style={{ gap: healthOSSpacing.md }}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {next
            ? `${next.title} · ${formatDateTime(next.scheduledAt)}`
            : "No pregnancy appointments added yet."}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Reminder scheduling is deferred unless an existing reminder flow is opened.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: healthOSSpacing.sm }}>
          <HealthOSPill label="Add appointment" onPress={onAddAppointment} variant="ai" />
          <HealthOSPill label="Add reminder" onPress={onAddReminder} variant="glass" />
          <HealthOSPill label="View calendar" onPress={onViewCalendar} variant="glass" />
          <HealthOSPill label="Upload record" onPress={onUploadRecord} variant="glass" />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}
