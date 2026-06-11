import { Bell, Camera, HeartPulse, Image as ImageIcon, MapPin, Mic } from "lucide-react-native";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppAlertCard, AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import { getDevicePermissionStates, openDeviceSettings } from "@/lib/devicePermissions";
import { getNotificationSettings } from "@/services/reminders/notificationService";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { DevicePermissionKey, DevicePermissionState, DevicePermissionStatus } from "@/types/devicePermissions";

const PERMISSIONS: Array<{
  contextualAction?: string;
  description: string;
  icon: typeof Camera;
  key: DevicePermissionKey;
  route?: string;
  title: string;
}> = [
  { contextualAction: "Open scanner", description: "Used for barcode scanners, invite QR codes, medication labels, documents, and profile photos.", icon: Camera, key: "camera", route: "/(tabs)/scan", title: "Camera" },
  { contextualAction: "Open profile photo", description: "Used when you choose to import documents, scanner images, food photos, or a profile photo.", icon: ImageIcon, key: "photos", route: "/settings/profile-contact", title: "Photos and media library" },
  { contextualAction: "Open notification settings", description: "Used for reminders, appointments, vaccinations, family updates, and alerts you enable.", icon: Bell, key: "notifications", route: "/settings/notifications", title: "Notifications" },
  { description: "The app does not currently use location or request location access.", icon: MapPin, key: "location", title: "Location" },
  { contextualAction: "Review device sync", description: "Apple Health and Health Connect are prepared but native integrations are not active in this Expo build.", icon: HeartPulse, key: "health_data", route: "/device-sync", title: "Health data" },
  { description: "Voice logging currently uses typed text. The app does not request microphone access.", icon: Mic, key: "microphone", title: "Microphone" }
];

export default function DevicePermissionsScreen() {
  const { theme } = useAppTheme();
  const [states, setStates] = useState<DevicePermissionState[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextStates, notificationSettings] = await Promise.all([getDevicePermissionStates(), getNotificationSettings()]);
      setStates(nextStates);
      setNotificationsEnabled(notificationSettings.notificationsEnabled);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Permission status could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function openSettings() {
    try {
      await openDeviceSettings();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "System settings could not be opened.");
    }
  }

  return (
    <AppMainLayout subtitle="Settings" title="Device permissions">
      <AppAlertCard message="Permissions are requested only when you start a feature that needs them. This screen does not request every permission at once." title="Contextual permissions" />
      {error ? <AppAlertCard message={error} title="Permission status unavailable" variant="danger" /> : null}
      {loading ? <AppCard style={styles.loading}><ActivityIndicator color={theme.primary} /><Text style={{ color: theme.mutedText }}>Checking device permissions...</Text></AppCard> : null}

      <AppSection title="Permission status" subtitle="Return to this screen after changing a permission in system settings.">
        {!loading ? PERMISSIONS.map((permission) => {
          const state = states.find((item) => item.key === permission.key);
          const status = state?.status ?? "unavailable";
          const Icon = permission.icon;
          return (
            <AppCard key={permission.key} style={styles.card}>
              <View style={styles.heading}>
                <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}><Icon color={theme.primary} size={21} /></View>
                <View style={styles.flex}><Text style={[styles.title, { color: theme.text }]}>{permission.title}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{permission.description}</Text></View>
                <AppChip label={formatStatus(status)} variant={statusVariant(status)} />
              </View>
              {permission.key === "notifications" ? <StatusRow label="App notification preference" value={notificationsEnabled ? "On" : "Off"} /> : null}
              <View style={styles.actions}>
                {permission.route && permission.contextualAction ? <AppButton onPress={() => router.push(permission.route as Href)} size="sm" title={permission.contextualAction} variant="secondary" /> : null}
                {status === "denied" || status === "limited" ? <AppButton onPress={openSettings} size="sm" title="Open system settings" variant="outline" /> : null}
              </View>
            </AppCard>
          );
        }) : null}
      </AppSection>
    </AppMainLayout>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return <View style={styles.between}><Text style={[styles.body, { color: theme.mutedText }]}>{label}</Text><Text style={[styles.value, { color: theme.text }]}>{value}</Text></View>;
}

function formatStatus(status: DevicePermissionStatus) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status: DevicePermissionStatus): "danger" | "muted" | "success" | "warning" {
  if (status === "allowed") return "success";
  if (status === "denied") return "danger";
  if (status === "limited") return "warning";
  return "muted";
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  between: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  body: { fontSize: 13, lineHeight: 19 },
  card: { gap: 14 },
  flex: { flex: 1 },
  heading: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  icon: { alignItems: "center", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  loading: { alignItems: "center", flexDirection: "row", gap: 12 },
  title: { fontSize: 15, fontWeight: "900" },
  value: { fontSize: 13, fontWeight: "900" }
});
