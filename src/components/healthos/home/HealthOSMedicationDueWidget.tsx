import { Href, router } from "expo-router";
import { Text, useColorScheme } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type WidgetProps = {
  onLongPress?: () => void;
};

export function HealthOSMedicationDueWidget({ onLongPress }: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      icon={<AppIcon color={palette.medication} decorative name="medication" size={22} />}
      onLongPress={onLongPress}
      onPress={() => router.push("/medication" as Href)}
      removable
      rightAccessory={<HealthOSPill label="Medication" size="sm" variant="realm" realmColor={palette.medication} />}
      subtitle="Schedule attention"
      title="Medication Due"
      variant="elevated"
      widgetKey="medicationDue"
    >
      <Text
        accessibilityLabel="Add your first medication reminder."
        style={[healthOSTypography.body, { color: palette.inkText }]}
      >
        Add your first medication reminder.
      </Text>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        HealthOS stores schedules for organization only. Always follow your
        prescription label and healthcare professional's instructions.
      </Text>
    </HealthOSWidget>
  );
}
