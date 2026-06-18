import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Smartphone } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSDevicePushStatus } from "@/features/reminders";

type Props = {
  onRegisterPush: () => void;
  status: HealthOSDevicePushStatus;
};

export function HealthOSDevicePushStatusCard({ onRegisterPush, status }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard icon={<Smartphone color={palette.ai} size={20} />} title="Device and push status">
      <View style={styles.stack}>
        <HealthOSPill label={status.label} size="sm" variant={status.status === "deferred" ? "warning" : "glass"} />
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {status.description}
        </Text>
        <HealthOSPill label="Register push later" onPress={onRegisterPush} size="sm" variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.sm,
  },
});
