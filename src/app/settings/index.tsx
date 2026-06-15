import { Href, router, useLocalSearchParams } from "expo-router";
import { ChevronRight, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppAvatar, AppCard, AppChip, AppFormInput, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { SETTINGS_CONTROL_PANEL_GROUPS, type SettingsControlPanelItem, type SettingsStatus } from "@/constants/settingsControlPanel";
import { useAuth } from "@/context/AuthContext";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

const CONTROL_CARDS: Array<{ description: string; icon: AppIconName; route: string; title: string }> = [
  { description: "Identity, contact details, and photo", icon: "profile", route: "/settings/profile-contact", title: "Account settings" },
  { description: "Theme, units, region, and accessibility", icon: "settings", route: "/onboarding/theme", title: "App preferences" },
  { description: "Consent and sensitive health areas", icon: "privacy", route: "/settings/privacy-center", title: "Privacy and sharing" },
  { description: "Profiles, members, and caregivers", icon: "circle", route: "/(tabs)/circle", title: "Family management" },
  { description: "Plan, billing, and Apple subscriptions", icon: "documents", route: "/settings/subscription", title: "Subscription" },
  { description: "Camera, photos, health, and location", icon: "device_sync", route: "/settings/device-permissions", title: "Device permissions" },
  { description: "Password, sessions, and app lock", icon: "safety", route: "/settings/security", title: "Security" },
  { description: "Reminders, alerts, and quiet hours", icon: "reminder", route: "/settings/notifications", title: "Notifications" }
];

const GROUP_ICONS: Record<string, AppIconName> = {
  account: "profile",
  data: "records",
  "medical-aid": "documents",
  notifications: "reminder",
  permissions: "device_sync",
  preferences: "settings",
  privacy: "privacy",
  security: "safety",
  subscription: "documents"
};

export default function SettingsControlPanelScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const { isAuthenticated, preferences, profile } = useAuth();
  const [query, setQuery] = useState(typeof params.query === "string" ? params.query : "");
  const normalizedQuery = query.trim().toLowerCase();
  const groups = useMemo(
    () => SETTINGS_CONTROL_PANEL_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => matchesSearch(group.title, item, normalizedQuery))
    })).filter((group) => group.items.length),
    [normalizedQuery]
  );

  return (
    <AppMainLayout subtitle="Account control panel" title="Settings">
      <ProfileHero
        avatarUri={profile?.avatarUrl ?? undefined}
        email={profile?.email ?? undefined}
        isAuthenticated={isAuthenticated}
        name={profile?.displayName ?? profile?.fullName ?? preferences?.displayName ?? "Your profile"}
      />

      <AppSection subtitle="Open the area you want to manage." title="Control panel">
        <View style={styles.controlGrid}>
          {CONTROL_CARDS.map((card) => <ControlCard key={card.title} {...card} />)}
        </View>
      </AppSection>

      <View style={styles.searchWrap}>
        <Search color="#64748b" size={19} />
        <AppFormInput
          accessibilityLabel="Search settings"
          containerStyle={styles.searchInput}
          onChangeText={setQuery}
          placeholder="Search password, camera, subscription, delete..."
          value={query}
        />
      </View>

      {groups.length ? groups.filter((group) => group.key !== "data").map((group) => (
        <AppSection
          actionLabel={group.future ? "Future" : `${group.items.length}`}
          key={group.key}
          subtitle={group.future ? "Placeholder features, not currently available." : undefined}
          title={group.title}
        >
          <View style={styles.group}>
            {group.items.map((item) => <SettingsRow groupKey={group.key} groupTitle={group.title} item={item} key={item.title} />)}
          </View>
        </AppSection>
      )) : (
        <AppSection title="No settings found" subtitle={`No settings match "${query.trim()}".`} />
      )}

      {groups.find((group) => group.key === "data") ? (
        <AppSection subtitle="Exports and account removal are kept separate from everyday settings." title="Data and account deletion">
          <View style={styles.dangerGroup}>
            {groups.find((group) => group.key === "data")?.items.map((item) => (
              <SettingsRow danger groupKey="data" groupTitle="Data and account deletion" item={item} key={item.title} />
            ))}
          </View>
        </AppSection>
      ) : null}
    </AppMainLayout>
  );
}

function ProfileHero({ avatarUri, email, isAuthenticated, name }: { avatarUri?: string; email?: string; isAuthenticated: boolean; name: string }) {
  const { theme } = useAppTheme();
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HS";

  return (
    <AppCard style={[styles.profileHero, { borderColor: theme.border }]}>
      <AppAvatar imageUri={avatarUri} initials={initials} size={96} />
      <Text style={[styles.profileName, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.profileMeta, { color: theme.mutedText }]}>{email ?? (isAuthenticated ? "Signed-in account" : "Local profile")}</Text>
      <AppChip label="Update photo and profile" onPress={() => router.push("/settings/profile-contact" as Href)} variant="primary" />
    </AppCard>
  );
}

function ControlCard({ description, icon, route, title }: { description: string; icon: AppIconName; route: string; title: string }) {
  const { theme } = useAppTheme();

  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(route as Href)} style={({ pressed }) => [styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
      <View style={styles.controlIcon}><AppIcon color={theme.primary} decorative name={icon} size={21} /></View>
      <Text style={[styles.controlTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.controlDescription, { color: theme.mutedText }]}>{description}</Text>
    </Pressable>
  );
}

function SettingsRow({ danger = false, groupKey, groupTitle, item }: { danger?: boolean; groupKey: string; groupTitle: string; item: SettingsControlPanelItem }) {
  const { theme } = useAppTheme();
  const { signOut } = useAuth();

  async function openItem() {
    if (item.action === "signOut") {
      await signOut();
      router.replace("/auth" as Href);
      return;
    }

    if (item.route) {
      router.push(item.route as Href);
      return;
    }

    router.push({
      pathname: "/settings/coming-later",
      params: { description: item.description, group: groupTitle, title: item.title }
    } as Href);
  }

  return (
    <Pressable
      accessibilityHint={item.status === "Coming later" || !item.route ? "This feature is marked as coming later" : "Opens setting"}
      accessibilityLabel={`${item.title}${item.status ? `, ${item.status}` : ""}`}
      accessibilityRole="button"
      onPress={openItem}
      style={({ pressed }) => [styles.row, danger ? styles.dangerRow : { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}
    >
      <View style={[styles.rowIcon, danger ? styles.dangerIcon : null]}>
        <AppIcon color={danger ? theme.danger : theme.primary} decorative name={GROUP_ICONS[groupKey] ?? "settings"} size={20} />
      </View>
      <View style={styles.copy}>
        <View style={styles.rowHeading}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
          {item.status ? <AppChip label={item.status} variant={statusVariant(item.status)} /> : null}
        </View>
        <Text style={[styles.description, { color: theme.mutedText }]}>{item.description}</Text>
      </View>
      <ChevronRight color={theme.mutedText} size={19} />
    </Pressable>
  );
}

function matchesSearch(groupTitle: string, item: SettingsControlPanelItem, query: string) {
  if (!query) return true;
  return [groupTitle, item.title, item.description, ...(item.keywords ?? [])].some((value) => value.toLowerCase().includes(query));
}

function statusVariant(status: SettingsStatus): "danger" | "info" | "muted" | "primary" | "success" | "warning" {
  if (status === "Verified" || status === "On") return "success";
  if (status === "Needs attention" || status === "Permission denied") return "danger";
  if (status === "Manage in system settings") return "info";
  if (status === "Coming later" || status === "Not connected" || status === "Off") return "muted";
  return "primary";
}

const styles = StyleSheet.create({
  controlCard: { borderRadius: 22, borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 108, padding: 14 },
  controlDescription: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  controlGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  controlIcon: { alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  controlTitle: { fontSize: 13, fontWeight: "900", marginTop: 10 },
  copy: { flex: 1, gap: 5, minWidth: 0 },
  dangerGroup: { backgroundColor: "#fff7f7", borderColor: "#fecaca", borderRadius: 24, borderWidth: 1, gap: 8, padding: 8 },
  dangerIcon: { backgroundColor: "#fee2e2" },
  dangerRow: { backgroundColor: "#fffafa", borderColor: "#fecaca" },
  description: { fontSize: 13, lineHeight: 18 },
  group: { gap: 8 },
  profileHero: { alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, padding: 20 },
  profileMeta: { fontSize: 12, marginBottom: 13, marginTop: 5 },
  profileName: { fontSize: 22, fontWeight: "900", marginTop: 12 },
  pressed: { opacity: 0.72 },
  row: { alignItems: "center", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 68, padding: spacing.md },
  rowHeading: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rowIcon: { alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  rowTitle: { flexShrink: 1, fontSize: 15, fontWeight: "900" },
  searchInput: { flex: 1 },
  searchWrap: { alignItems: "center", flexDirection: "row", gap: 10 }
});
