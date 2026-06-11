import { Href, router, useLocalSearchParams } from "expo-router";
import { ChevronRight, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppChip, AppFormInput, AppSection } from "@/components/ui";
import { SETTINGS_CONTROL_PANEL_GROUPS, type SettingsControlPanelItem, type SettingsStatus } from "@/constants/settingsControlPanel";
import { useAuth } from "@/context/AuthContext";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function SettingsControlPanelScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
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

      {groups.length ? groups.map((group) => (
        <AppSection
          actionLabel={group.future ? "Future" : `${group.items.length}`}
          key={group.key}
          subtitle={group.future ? "Placeholder features, not currently available." : undefined}
          title={group.title}
        >
          <View style={styles.group}>
            {group.items.map((item) => <SettingsRow groupTitle={group.title} item={item} key={item.title} />)}
          </View>
        </AppSection>
      )) : (
        <AppSection title="No settings found" subtitle={`No settings match "${query.trim()}".`} />
      )}
    </AppMainLayout>
  );
}

function SettingsRow({ groupTitle, item }: { groupTitle: string; item: SettingsControlPanelItem }) {
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
      style={({ pressed }) => [styles.row, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}
    >
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
  copy: { flex: 1, gap: 5, minWidth: 0 },
  description: { fontSize: 13, lineHeight: 18 },
  group: { gap: 8 },
  pressed: { opacity: 0.72 },
  row: { alignItems: "center", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 68, padding: spacing.md },
  rowHeading: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rowTitle: { flexShrink: 1, fontSize: 15, fontWeight: "900" },
  searchInput: { flex: 1 },
  searchWrap: { alignItems: "center", flexDirection: "row", gap: 10 }
});
