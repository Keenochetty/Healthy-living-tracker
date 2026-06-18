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
  onDismiss?: () => void;
  onLongPress?: () => void;
};

export function HealthOSAISuggestionWidget({
  onDismiss,
  onLongPress,
}: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      icon={<AppIcon color={palette.ai} decorative name="ai" size={22} />}
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/scan" as Href)}
      removable
      subtitle="Quiet, dismissible help"
      title="AI Suggestion"
      variant="ai"
      widgetKey="aiSuggestion"
    >
      <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
        Scan a label or script to import it into your app.
      </Text>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        This card opens existing app tools only. It does not call the AI backend.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill
          label="Open scan"
          onPress={() => router.push("/(tabs)/scan" as Href)}
          variant="ai"
        />
        {onDismiss ? (
          <HealthOSPill label="Dismiss" onPress={onDismiss} variant="glass" />
        ) : null}
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
