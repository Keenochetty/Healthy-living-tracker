import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  AccessControlRow,
  HealthCard,
  QuickActionButton,
  StatusSurface,
  StatusPill,
  WidgetCard,
  type AppIconName,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type HealthShortcut = {
  icon: AppIconName;
  label: string;
  route: string;
  subtitle: string;
  tone: string;
};

const healthShortcuts: HealthShortcut[] = [
  {
    icon: "medication",
    label: "Medication",
    route: "/health/medication",
    subtitle: "Reminder-level summary only",
    tone: colors.status.warning,
  },
  {
    icon: "doctor",
    label: "Conditions",
    route: "/health/conditions",
    subtitle: "Safe condition overview",
    tone: colors.status.warning,
  },
  {
    icon: "documents",
    label: "Documents",
    route: "/health/documents",
    subtitle: "Protected file access",
    tone: colors.status.system,
  },
  {
    icon: "calendar",
    label: "Health events",
    route: "/tabs/calendar",
    subtitle: "Appointments and reminders",
    tone: colors.brand.primary,
  },
];

const upcomingHealth = [
  {
    label: "Doctor appointment",
    meta: "Tomorrow, 10:00",
    tone: colors.status.warning,
  },
  {
    label: "Medication reminder",
    meta: "Today, 18:00",
    tone: colors.status.warning,
  },
  {
    label: "Wellness check-in",
    meta: "Friday, 09:30",
    tone: colors.brand.secondary,
  },
];

const permissionImports: Array<{
  icon: AppIconName;
  label: string;
  note: string;
  tone: "ai" | "private" | "success" | "system";
}> = [
  {
    icon: "camera",
    label: "Camera",
    note: "Profile photos and document capture.",
    tone: "private",
  },
  {
    icon: "voice",
    label: "Microphone",
    note: "Health AI voice capture placeholder.",
    tone: "ai",
  },
  {
    icon: "calendar",
    label: "Device calendars",
    note: "Apple/Google calendar import placeholder.",
    tone: "success",
  },
  {
    icon: "documents",
    label: "Documents",
    note: "File upload placeholder.",
    tone: "system",
  },
  {
    icon: "sync",
    label: "Import info",
    note: "Birthdays and current info import placeholder.",
    tone: "success",
  },
];

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function HealthMonitorScreen() {
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<StatusPill label="Safe summaries" tone="success" />}
          eyebrow="Health Monitor"
          subtitle="A calm overview for reminders, protected health shortcuts, and device import placeholders."
          title="Health Monitor"
        />

        <StatusSurface
          action={<StatusPill label="Protected" tone="success" />}
          description="Reminder counts and safe shortcuts only. Private health details stay behind intentional taps."
          icon="activity"
          title="Health status"
          tone="connected"
        />

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <HealthCard
              accentColor={colors.status.success}
              label="Today"
              status="On track"
              subtitle="No sensitive details shown in previews."
              value="3 items"
            />
          </View>
          <View style={styles.metricItem}>
            <HealthCard
              accentColor={colors.status.warning}
              label="Medication"
              status="Protected"
              subtitle="Reminder count only on dashboard surfaces."
              value="0 due"
            />
          </View>
        </View>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Shortcuts" />}
          subtitle="Two-column on wider screens, compact and safe on mobile."
          title="Health shortcuts"
        >
          <View style={styles.shortcutGrid}>
            {healthShortcuts.map((shortcut) => (
              <Pressable
                accessibilityRole="button"
                key={shortcut.label}
                onPress={() => openRoute(shortcut.route)}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.iconShell,
                    { backgroundColor: `${shortcut.tone}20` },
                  ]}
                >
                  <AppIcon
                    color={shortcut.tone}
                    name={shortcut.icon}
                    size={22}
                  />
                </View>
                <View style={styles.shortcutCopy}>
                  <Text style={styles.cardTitle}>{shortcut.label}</Text>
                  <Text style={styles.muted}>{shortcut.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.warning}
          action={<StatusPill label="Upcoming" tone="warning" />}
          subtitle="Health events stay readable without exposing private details."
          title="Upcoming health"
        >
          <View style={styles.list}>
            {upcomingHealth.map((item) => (
              <View key={item.label} style={styles.rowCard}>
                <View style={[styles.dot, { backgroundColor: item.tone }]} />
                <View style={styles.shortcutCopy}>
                  <Text style={styles.cardTitle}>{item.label}</Text>
                  <Text style={styles.muted}>{item.meta}</Text>
                </View>
                <QuickActionButton
                  label="Open"
                  onPress={() => openRoute("/tabs/calendar")}
                  toneColor={item.tone}
                />
              </View>
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="Placeholders" tone="ai" />}
          subtitle="No package installs or native permission config changes in this cleanup."
          title="Device permissions and imports"
        >
          <View style={styles.list}>
            {permissionImports.map((item) => (
              <AccessControlRow
                description={item.note}
                icon={item.icon}
                key={item.label}
                label={item.label}
                onPress={() =>
                  setPlaceholderMessage(
                    `${item.label} permission request will connect later. ${item.note}`,
                  )
                }
                statusLabel="Later"
                tone={item.tone}
              />
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.emergency}
          action={<StatusPill label="Visible" tone="emergency" />}
          subtitle="Emergency actions stay visible and are not hidden in a carousel."
          title="Emergency access"
        >
          <View style={styles.rowCard}>
            <View
              style={[
                styles.iconShell,
                { backgroundColor: colors.status.emergencySoft },
              ]}
            >
              <AppIcon
                color={colors.status.emergency}
                name="emergency"
                size={22}
              />
            </View>
            <View style={styles.shortcutCopy}>
              <Text style={styles.cardTitle}>Emergency contacts</Text>
              <Text style={styles.muted}>
                Open approved emergency contacts and urgent instructions.
              </Text>
            </View>
            <QuickActionButton
              label="Open"
              onPress={() => openRoute("/settings/emergency-contacts")}
              toneColor={colors.status.emergency}
            />
          </View>
        </WidgetCard>

        <Modal
          transparent
          visible={Boolean(placeholderMessage)}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPlaceholderMessage(null)}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Permission placeholder</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton
                label="Close"
                onPress={() => setPlaceholderMessage(null)}
                toneColor={colors.brand.primary}
              />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  dot: {
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  list: {
    gap: spacing.md,
  },
  metricItem: {
    flex: 1,
    minWidth: 220,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%",
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  rowCard: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.md,
  },
  shortcutCard: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 66,
    padding: spacing.md,
  },
  shortcutCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  shortcutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
