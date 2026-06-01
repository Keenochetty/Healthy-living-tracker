import * as Localization from "expo-localization";

import { StyleSheet, View } from "react-native";

import { AppHeader, AppIcon, AppScreen, SettingsRow, StatusPill, WidgetCard } from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { getDeviceSettingsDefaults } from "@/lib/settings";

export default function LanguageRegionSettingsScreen() {
  const locale = Localization.getLocales()[0];
  const calendar = Localization.getCalendars()[0];
  const deviceDefaults = getDeviceSettingsDefaults();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Settings"
        subtitle="Device locale, region, calendar, measurement system, and clock defaults."
        title="Language & region"
      />
      <WidgetCard accentColor={colors.brand.primary} title="Device defaults" subtitle="These values come from the current device.">
        <View style={styles.section}>
          <SettingsRow
            icon={<AppIcon color={colors.brand.primary} name="language" size={20} />}
            label="Language"
            subtitle={locale.languageTag}
            accessory={<StatusPill label="Device default" />}
          />
          <SettingsRow
            icon={<AppIcon color={colors.status.success} name="language" size={20} />}
            label="Region"
            subtitle={locale.regionCode ?? "Not reported"}
          />
          <SettingsRow
            icon={<AppIcon color={colors.status.ai} name="calendar" size={20} />}
            label="Calendar"
            subtitle={`${calendar.calendar ?? "Device calendar"} - ${calendar.timeZone ?? "Device timezone"}`}
          />
          <SettingsRow
            accessory={<StatusPill label={deviceDefaults.weight} />}
            icon={<AppIcon color={colors.brand.primary} name="units" size={20} />}
            label="Measurement system"
            subtitle={deviceDefaults.measurementSystem}
          />
          <SettingsRow
            icon={<AppIcon color={colors.status.system} name="settings" size={20} />}
            label="Clock preference"
            subtitle={deviceDefaults.timeFormat === "24_hour" ? "24-hour time" : "12-hour time"}
          />
        </View>
      </WidgetCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md
  }
});
