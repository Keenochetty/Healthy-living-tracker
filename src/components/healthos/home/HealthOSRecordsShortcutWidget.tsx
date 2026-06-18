import { Href, router } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type WidgetProps = {
  onLongPress?: () => void;
};

export function HealthOSRecordsShortcutWidget({ onLongPress }: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      icon={<AppIcon color={palette.records} decorative name="records" size={22} />}
      onLongPress={onLongPress}
      onPress={() => router.push("/records" as Href)}
      removable
      subtitle="Documents and scripts"
      title="Records Shortcut"
      variant="accordion"
      widgetKey="recordsShortcut"
    >
      <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
        Scan or upload medical records.
      </Text>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Keep scripts, vaccine cards, and reports together.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill
          label="Open records"
          onPress={() => router.push("/records" as Href)}
          realmColor={palette.records}
          variant="realm"
        />
        <HealthOSPill
          label="Scan"
          onPress={() => router.push("/(tabs)/scan" as Href)}
          variant="ai"
        />
      </View>
    </HealthOSWidget>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
