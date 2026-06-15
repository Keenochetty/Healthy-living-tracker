import {
  AppHeader,
  AppIcon,
  AppScreen,
  SettingsRow,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

export default function AboutSettingsScreen() {
  return (
    <AppScreen>
      <AppHeader
        eyebrow="Settings"
        title="About"
        subtitle="Family Health app foundation and support basics."
      />
      <WidgetCard
        accentColor={colors.brand.primary}
        title="App information"
        subtitle="Useful details for support and review."
      >
        <View style={styles.section}>
          <SettingsRow
            icon={
              <AppIcon color={colors.brand.primary} name="settings" size={20} />
            }
            label="Version"
            subtitle="1.0.0"
            accessory={<StatusPill label="MVP" tone="ai" />}
          />
          <SettingsRow
            icon={
              <AppIcon color={colors.status.success} name="privacy" size={20} />
            }
            label="Privacy"
            subtitle="Sensitive content uses safe previews and row-level security."
          />
          <SettingsRow
            icon={<AppIcon color={colors.status.ai} name="ai" size={20} />}
            label="Status"
            subtitle="In-app auth, onboarding, family, caregiver, calendar, notifications, and AI foundations."
          />
        </View>
      </WidgetCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
});
