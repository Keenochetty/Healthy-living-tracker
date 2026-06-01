import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppHeader, AppIcon, AppScreen, SettingsRow, StatusPill, WidgetCard, type AppIconName } from "@/components/ui";
import { settingsSections } from "@/constants/settings";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

function openSettingsRoute(href: string) {
  router.push(href as Parameters<typeof router.push>[0]);
}

export default function SettingsScreen() {
  return (
    <AppScreen>
      <AppHeader
        eyebrow="Settings"
        subtitle="Clean basics for account, care sharing, app preferences, connected services, security, and support."
        title="Settings"
      />

      {settingsSections.map((section) => (
        <WidgetCard
          accentColor={getSectionColor(section.title)}
          action={<StatusPill label={`${section.items.length} items`} />}
          key={section.title}
          title={section.title}
        >
          <View style={styles.section}>
            {section.items.map((item) => (
              <SettingsRow
                icon={<AppIcon color={getSectionColor(section.title)} name={getItemIcon(item.label)} size={20} />}
                key={`${section.title}-${item.href}-${item.label}`}
                label={item.label}
                onPress={() => openSettingsRoute(item.href)}
                subtitle={item.subtitle}
              />
            ))}
          </View>
        </WidgetCard>
      ))}
    </AppScreen>
  );
}

function getSectionColor(section: string) {
  switch (section) {
    case "Family & Sharing":
      return colors.status.success;
    case "Caregiver Access":
      return colors.brand.secondary;
    case "Connected Services":
      return colors.status.ai;
    case "Security":
      return colors.status.system;
    case "Support":
      return colors.accent.coral;
    default:
      return colors.brand.primary;
  }
}

function getItemIcon(label: string): AppIconName {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("calendar")) return "calendar";
  if (lowerLabel.includes("caregiver")) return "caregiver";
  if (lowerLabel.includes("privacy") || lowerLabel.includes("sensitive")) return "privacy";
  if (lowerLabel.includes("notification")) return "notifications";
  if (lowerLabel.includes("appearance")) return "settings";
  if (lowerLabel.includes("unit")) return "units";
  if (lowerLabel.includes("language")) return "language";
  if (lowerLabel.includes("voice")) return "voice";
  if (lowerLabel.includes("ai")) return "ai";
  if (lowerLabel.includes("lock") || lowerLabel.includes("audit")) return "lock";
  if (lowerLabel.includes("family") || lowerLabel.includes("emergency")) return "family";

  return "profiles";
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md
  }
});
