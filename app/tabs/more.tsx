import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AccessControlRow,
  AppHeader,
  AppIcon,
  AppScreen,
  StatusPill,
  StatusSurface,
  WidgetCard,
  type AppIconName
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type SettingsItem = {
  icon: AppIconName;
  label: string;
  route: string;
  subtitle: string;
  tint: string;
};

type SettingsSection = {
  items: SettingsItem[];
  title: string;
};

const settingsSections: SettingsSection[] = [
  {
    title: "Account",
    items: [
      { icon: "profiles", label: "Account", route: "/settings/account", subtitle: "Sign-in, account details, and identity.", tint: colors.brand.primary },
      { icon: "profiles", label: "Profile", route: "/settings/profile", subtitle: "Personal profile basics and preferences.", tint: colors.brand.primary }
    ]
  },
  {
    title: "Family & Care",
    items: [
      { icon: "family", label: "Family/Care Circles", route: "/circles", subtitle: "Circles, members, roles, and relationships.", tint: colors.status.success },
      { icon: "caregiver", label: "Caregiver Access", route: "/settings/caregiver-access", subtitle: "Assigned-only caregiver access and work mode.", tint: colors.brand.secondary },
      { icon: "privacy", label: "Privacy & Sharing", route: "/privacy/permissions", subtitle: "Adult consent, teen transition, and permission presets.", tint: colors.status.system }
    ]
  },
  {
    title: "App Preferences",
    items: [
      { icon: "notifications", label: "Notifications", route: "/settings/notifications", subtitle: "Safe previews and colour meanings.", tint: colors.status.warning },
      { icon: "settings", label: "Appearance", route: "/settings/appearance", subtitle: "Display and visual preferences.", tint: colors.status.ai },
      { icon: "units", label: "Units & Measurements", route: "/settings/measurement-units", subtitle: "Metric, imperial, time, and date formats.", tint: colors.brand.primary },
      { icon: "language", label: "Language & Region", route: "/settings/language-region", subtitle: "Regional preferences and localization.", tint: colors.status.success }
    ]
  },
  {
    title: "Connected Features",
    items: [
      { icon: "sync", label: "Calendar Sync", route: "/settings/calendar-sync", subtitle: "Google and Apple sync placeholders.", tint: colors.brand.primary },
      { icon: "voice", label: "Voice Assistant", route: "/settings/voice-assistant", subtitle: "Voice capture and assistant controls.", tint: colors.status.ai },
      { icon: "ai", label: "AI Assistant", route: "/settings/ai-assistant", subtitle: "Safe AI suggestions and assistant settings.", tint: colors.status.ai }
    ]
  },
  {
    title: "Safety & Support",
    items: [
      { icon: "lock", label: "Security", route: "/settings/security", subtitle: "App lock, sessions, and safety controls.", tint: colors.status.system },
      { icon: "settings", label: "Help & About", route: "/settings/help", subtitle: "Support, legal, and app information.", tint: colors.brand.primary }
    ]
  }
];

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function MoreScreen() {
  const sectionCount = settingsSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<StatusPill label="Settings hub" />}
          eyebrow="More"
          subtitle="Grouped account, circle, privacy, assistant, and support settings."
          title="Settings"
        />

        <StatusSurface
          action={<StatusPill label="Comfort first" tone="success" />}
          description="Display, access, and connected-feature controls are grouped into clear rows with large touch targets."
          icon="settings"
          title="Warm, accessible controls"
          tone="connected"
        />

        {settingsSections.map((section) => (
          <WidgetCard
            accentColor={colors.brand.primary}
            action={<StatusPill label={`${section.items.length}`} tone="default" />}
            key={section.title}
            subtitle={section.title === "Family & Care" ? "Caregiver work stays in Care, not the Home switcher." : "Simple rows with clear labels and short descriptions."}
            title={section.title}
          >
            <View style={styles.grid}>
              {section.items.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item.label}
                  onPress={() => openRoute(item.route)}
                  style={({ pressed }) => [styles.item, pressed && styles.pressed]}
                >
                  <View style={[styles.iconShell, { backgroundColor: `${item.tint}20` }]}>
                    <AppIcon color={item.tint} name={item.icon} size={23} />
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <AppIcon color={colors.text.muted} name="chevron" size={18} />
                </Pressable>
              ))}
            </View>
          </WidgetCard>
        ))}

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label="Placeholders" tone="success" />}
          subtitle="Display and accessibility controls can connect to user preferences later."
          title="Accessibility"
        >
          <View style={styles.grid}>
            <AccessControlRow
              description="Larger labels and cards for users who prefer more readable screens."
              icon="settings"
              label="Text size"
              onPress={() => openRoute("/settings/appearance")}
              statusLabel="Standard"
              tone="success"
            />
            <AccessControlRow
              description="Higher contrast surfaces for better readability in care workflows."
              icon="shield"
              label="High contrast"
              onPress={() => openRoute("/settings/appearance")}
              statusLabel="Available later"
              tone="private"
            />
            <AccessControlRow
              description="Reduce motion and carousel movement where supported."
              icon="activity"
              label="Motion comfort"
              onPress={() => openRoute("/settings/appearance")}
              statusLabel="Available later"
              tone="system"
            />
          </View>
        </WidgetCard>

        <Text style={styles.footerNote}>{sectionCount} settings shortcuts grouped for faster scanning.</Text>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0
  },
  footerNote: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  },
  grid: {
    gap: spacing.md
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  item: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md
  },
  itemLabel: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  itemSubtitle: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 18
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
