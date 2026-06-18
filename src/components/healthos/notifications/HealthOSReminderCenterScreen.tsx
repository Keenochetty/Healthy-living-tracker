import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { router } from "expo-router";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import type { HealthOSReminderReviewCandidate } from "@/features/reminders";
import {
  HEALTHOS_NOTIFICATION_PRIVACY_COPY,
  HEALTHOS_REMINDER_LOCK_SCREEN_RULES,
} from "@/features/reminders";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSDevicePushStatusCard } from "./HealthOSDevicePushStatusCard";
import { HealthOSNeedsReviewQueue } from "./HealthOSNeedsReviewQueue";
import { HealthOSNotificationCategoryPreferences } from "./HealthOSNotificationCategoryPreferences";
import { HealthOSNotificationPermissionCard } from "./HealthOSNotificationPermissionCard";
import { HealthOSQuietHoursCard } from "./HealthOSQuietHoursCard";
import { HealthOSReminderCenterHeader } from "./HealthOSReminderCenterHeader";
import { HealthOSReminderFilterRow } from "./HealthOSReminderFilterRow";
import { HealthOSReminderHistorySection } from "./HealthOSReminderHistorySection";
import { HealthOSReminderInboxList } from "./HealthOSReminderInboxList";
import { HealthOSReminderQuickActions } from "./HealthOSReminderQuickActions";
import { HealthOSReminderReviewSheet } from "./HealthOSReminderReviewSheet";
import { HealthOSTodayReminderHero } from "./HealthOSTodayReminderHero";
import { HealthOSUpcomingScheduleSection } from "./HealthOSUpcomingScheduleSection";
import { useHealthOSNotificationsActions } from "./useHealthOSNotificationsActions";
import { useHealthOSNotificationsData } from "./useHealthOSNotificationsData";

export function HealthOSReminderCenterScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const data = useHealthOSNotificationsData();
  const actions = useHealthOSNotificationsActions({ onRefresh: data.refresh });
  const [reviewCandidate, setReviewCandidate] =
    useState<HealthOSReminderReviewCandidate | null>(null);

  function openManualReview() {
    setReviewCandidate({
      category: "custom",
      id: "manual-review",
      reason: "Create a new reminder through a review-first flow.",
      source: "manual",
      title: "New reminder draft",
    });
  }

  return (
    <HealthOSAppShell
      activeNavKey="home"
      aiPlaceholder="Ask about reminders, alerts, or health plans"
      showBottomNav={false}
      subtitle="Alerts and reminder review"
      testID="healthos-reminder-center-screen"
      title="Reminders"
      withBottomNavSpace={false}
    >
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <HealthOSReminderCenterHeader
            permission={data.permission}
            reminderCount={data.inboxItems.length}
          />
          {data.loading ? (
            <HealthOSCard>
              <View style={styles.loading}>
                <ActivityIndicator color={palette.ai} />
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  Loading reminder center...
                </Text>
              </View>
            </HealthOSCard>
          ) : null}
          {data.error ? (
            <HealthOSCard title="Reminder Center unavailable" variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {data.error}
              </Text>
            </HealthOSCard>
          ) : null}
          <HealthOSNotificationPermissionCard
            onOpenSettings={actions.openDeviceSettings}
            onRequestPermission={actions.enableNotifications}
            permission={data.permission}
          />
          <HealthOSTodayReminderHero summary={data.todaySummary} />
          <HealthOSReminderQuickActions
            onAddReminder={openManualReview}
            onOpenSchedule={() => router.push("/health-calendar")}
            onPrivacy={() =>
              Alert.alert(
                "Notification privacy",
                [HEALTHOS_NOTIFICATION_PRIVACY_COPY, ...HEALTHOS_REMINDER_LOCK_SCREEN_RULES].join("\n\n"),
              )
            }
          />
          <HealthOSReminderFilterRow
            activeFilter={data.activeFilter}
            onChange={data.setActiveFilter}
          />
          <HealthOSReminderInboxList
            items={data.filteredInboxItems}
            onDone={actions.markDone}
            onOpen={actions.openReminder}
            onSnooze={actions.snooze}
          />
          <HealthOSUpcomingScheduleSection
            onDone={actions.markDone}
            onOpen={actions.openReminder}
            onSnooze={actions.snooze}
            sections={data.upcomingSections}
          />
          <HealthOSNeedsReviewQueue
            items={data.needsReviewQueue}
            onReview={setReviewCandidate}
          />
          <HealthOSQuietHoursCard
            onToggle={actions.updateQuietHours}
            quietHours={data.quietHours}
          />
          <HealthOSNotificationCategoryPreferences
            items={data.categoryPreferences}
            onQuickActionsChange={actions.updateCategoryQuickActions}
            onToggleNotification={actions.updateCategoryNotification}
          />
          <HealthOSDevicePushStatusCard
            onRegisterPush={actions.registerPushToken}
            status={data.devicePushStatus}
          />
          <HealthOSReminderHistorySection items={data.history} />
          <Text style={[healthOSTypography.caption, styles.privacy, { color: palette.softText }]}>
            Reminder Center uses existing reminder data and local notification records. Remote push registration and AI-created reminder saving remain review-gated.
          </Text>
        </ScrollView>
      </View>
      <HealthOSReminderReviewSheet
        candidate={reviewCandidate}
        onClose={() => setReviewCandidate(null)}
        onSaveReviewed={actions.saveReviewedReminder}
        visible={Boolean(reviewCandidate)}
      />
    </HealthOSAppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.lg,
    paddingBottom: healthOSSafeArea.bottomNavSpace,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.md,
  },
  loading: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  privacy: {
    paddingBottom: healthOSSpacing.xl,
  },
  screen: {
    alignSelf: "center",
    flex: 1,
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
});
