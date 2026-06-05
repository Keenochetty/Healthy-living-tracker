import { useCallback, useEffect, useState } from "react";
import { Text, TextInput, View, Switch } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import {
  getHealthReminders,
  getOverdueReminders,
  reconcileScheduledNotifications
} from "@/services/reminders/reminderEngine";
import {
  REMINDER_CATEGORIES,
  getNotificationPermissionStatus,
  getNotificationSettings,
  getReminderCategorySettings,
  getScheduledNotificationRecords,
  requestNotificationPermission,
  scheduleLocalNotification,
  updateNotificationSettings,
  updateReminderCategorySettings
} from "@/services/reminders/notificationService";
import type { NotificationSettings, ReminderCategorySettings } from "@/types/healthTimeline";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 14,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 48,
  paddingHorizontal: 12
};

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [categorySettings, setCategorySettings] = useState<ReminderCategorySettings[]>([]);
  const [activeReminders, setActiveReminders] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastReconciledAt, setLastReconciledAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [nextSettings, nextCategorySettings, reminders, overdue, records, permissionStatus] = await Promise.all([
      getNotificationSettings(),
      getReminderCategorySettings(),
      getHealthReminders(),
      getOverdueReminders(),
      getScheduledNotificationRecords(),
      getNotificationPermissionStatus()
    ]);

    setSettings({ ...nextSettings, permissionStatus });
    setCategorySettings(nextCategorySettings);
    setActiveReminders(reminders.filter((reminder) => reminder.status !== "cancelled" && reminder.status !== "completed").length);
    setOverdueCount(overdue.length);
    setScheduledCount(records.filter((record) => record.status === "scheduled").length);
    setFailedCount(records.filter((record) => record.status === "failed").length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const saveSettings = async (partial: Partial<NotificationSettings>) => {
    const next = await updateNotificationSettings(partial);
    setSettings(next);
    await load();
  };

  const requestPermission = async () => {
    await requestNotificationPermission();
    await load();
  };

  const runReconcile = async () => {
    const summary = await reconcileScheduledNotifications();
    setLastReconciledAt(summary.lastReconciledAt);
    await load();
  };

  const sendTest = async () => {
    const when = new Date(Date.now() + 60 * 1000).toISOString();
    await scheduleLocalNotification({
      body: "Device notifications are optional. In-app reminders still work.",
      category: "custom",
      detailLevel: "private",
      reminderId: "test-notification",
      route: "/health-calendar",
      scheduledAt: when,
      title: "Health reminder"
    });
    await load();
  };

  return (
    <AppMainLayout subtitle="Settings" title="Notifications">
      <AppCard backgroundColor="#f8fafc">
        <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>Notification Settings</Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Notifications help remind you about health events you choose. You can still use in-app reminders if notifications are off.
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 8 }}>
          {settings?.permissionStatus === "denied"
            ? "Notifications are off. You can turn them on in your device settings. In-app reminders will still work."
            : "Device notifications are optional and privacy-safe by default."}
        </Text>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <InfoRow label="Permission" value={formatValue(settings?.permissionStatus ?? "not_requested")} />
          <InfoRow label="In-app reminders" value="On" />
          <InfoRow label="Device notifications" value={settings?.notificationsEnabled ? "On" : "Off"} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <AppButton onPress={requestPermission} title="Request Permission" />
            <AppButton onPress={sendTest} title="Test Notification" variant="secondary" />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <AppSection title="Privacy + Quiet Hours" subtitle="Sensitive reminders hide details unless you choose otherwise." />
          <ToggleRow
            label="Sensitive lock-screen privacy"
            onChange={(value) => saveSettings({ sensitiveLockScreenPrivate: value })}
            value={Boolean(settings?.sensitiveLockScreenPrivate)}
          />
          <ToggleRow
            label="Quiet hours"
            onChange={(value) => saveSettings({ quietHoursEnabled: value })}
            value={Boolean(settings?.quietHoursEnabled)}
          />
          <TextInput
            onChangeText={(value) => saveSettings({ quietHoursStart: value })}
            placeholder="Quiet hours start HH:MM"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={settings?.quietHoursStart ?? "22:00"}
          />
          <TextInput
            onChangeText={(value) => saveSettings({ quietHoursEnd: value })}
            placeholder="Quiet hours end HH:MM"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={settings?.quietHoursEnd ?? "07:00"}
          />
        </View>
      </AppCard>

      <AppCard>
        <AppSection title="Reminder Categories" subtitle={categorySettings.length ? "Turn on reminder categories you want to use." : "Turn on reminder categories you want to use."} />
        <View style={{ gap: 10 }}>
          {REMINDER_CATEGORIES.map((category) => {
            const item = categorySettings.find((setting) => setting.category === category);
            return (
              <View key={category} style={{ borderTopColor: "#e2e8f0", borderTopWidth: 1, gap: 8, paddingTop: 10 }}>
                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontWeight: "900" }}>{formatValue(category)}</Text>
                    <Text style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
                      {formatValue(item?.detailLevel ?? "private")} details · quiet hours {formatValue(item?.quietHoursBehavior ?? "delay")}
                    </Text>
                  </View>
                  <Switch
                    onValueChange={(value) => updateReminderCategorySettings(category, { enabled: value, notificationEnabled: value }).then(load)}
                    value={Boolean(item?.enabled)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <AppSection title="Reliability" subtitle="Local reminder reconciliation status." />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <AppChip label={`${activeReminders} active`} variant="primary" />
          <AppChip label={`${scheduledCount} scheduled`} variant="success" />
          <AppChip label={`${failedCount} failed`} variant={failedCount ? "warning" : "muted"} />
          <AppChip label={`${overdueCount} due`} variant={overdueCount ? "warning" : "muted"} />
        </View>
        {lastReconciledAt ? <Text style={{ color: "#64748b", marginTop: 10 }}>Last reconciliation: {new Date(lastReconciledAt).toLocaleString()}</Text> : null}
        <View style={{ marginTop: 12 }}>
          <AppButton onPress={runReconcile} title="Reconcile Now" variant="secondary" />
        </View>
      </AppCard>

      <Text style={{ color: "#64748b", lineHeight: 20 }}>
        Reminders help you stay organized. They do not replace prescription labels, product leaflets, clinic instructions, or healthcare professionals.
      </Text>
    </AppMainLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ color: "#64748b", fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: "#0f172a", flex: 1, fontWeight: "900", textAlign: "right" }}>{value}</Text>
    </View>
  );
}

function ToggleRow({ label, onChange, value }: { label: string; onChange: (value: boolean) => void; value: boolean }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, flexDirection: "row", justifyContent: "space-between", padding: 12 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </View>
  );
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
