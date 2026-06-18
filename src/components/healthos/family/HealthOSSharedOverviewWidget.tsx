import { Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSSharedUpdateDisplay } from "./HealthOSFamilyTypes";
import { HealthOSSharedUpdateRow } from "./HealthOSSharedUpdateRow";

type HealthOSSharedOverviewWidgetProps = {
  emptyText: string;
  updates: HealthOSSharedUpdateDisplay[];
};

export function HealthOSSharedOverviewWidget({
  emptyText,
  updates,
}: HealthOSSharedOverviewWidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      icon={<AppIcon decorative name="shared" size={20} variant="primary" />}
      subtitle="Only shared family updates appear here"
      title="Shared overview"
      widgetKey="family-shared-overview"
    >
      {updates.length ? (
        <View style={{ gap: healthOSSpacing.md }}>
          {updates.slice(0, 4).map((update) => (
            <HealthOSSharedUpdateRow key={update.id} update={update} />
          ))}
        </View>
      ) : (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {emptyText}
        </Text>
      )}
    </HealthOSWidget>
  );
}

