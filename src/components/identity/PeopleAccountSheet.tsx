import { Href, router } from "expo-router";
import { Check, ChevronRight, CirclePlus, HelpCircle, LogOut, Settings, UserRound, UsersRound, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppAvatar } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import type { HealthProfile } from "@/types/familyPermissions";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type PeopleAccountSheetProps = {
  activeProfile: HealthProfile | null;
  onClose: () => void;
  onOpenProfile: (profile: HealthProfile) => void;
  onSelectProfile: (profileId: string) => Promise<void>;
  profiles: HealthProfile[];
  visible: boolean;
};

export function PeopleAccountSheet({
  activeProfile,
  onClose,
  onOpenProfile,
  onSelectProfile,
  profiles,
  visible
}: PeopleAccountSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { signOut } = useAuth();

  function openRoute(route: Href) {
    onClose();
    router.push(route);
  }

  async function handleSignOut() {
    onClose();
    await signOut();
    router.replace("/auth" as Href);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="Close People and Account" accessibilityRole="button" onPress={onClose} style={styles.scrim} />
        <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border, maxHeight: height * 0.9, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <View style={styles.copy}>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>People & Account</Text>
              <Text style={[styles.subtitle, { color: theme.mutedText }]}>Switch the viewed person without changing who is signed in.</Text>
            </View>
            <Pressable accessibilityLabel="Close People and Account" accessibilityRole="button" onPress={onClose} style={[styles.close, { backgroundColor: theme.primarySoft }]}>
              <X color={theme.primary} size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {activeProfile ? (
              <SheetSection title="Current view">
                <ProfileRow
                  active
                  onPress={() => onOpenProfile(activeProfile)}
                  profile={activeProfile}
                  trailingLabel="View profile"
                />
              </SheetSection>
            ) : null}

            <SheetSection title="Switch person">
              {profiles.map((profile) => (
                <ProfileRow
                  active={profile.id === activeProfile?.id}
                  key={profile.id}
                  onPress={async () => {
                    await onSelectProfile(profile.id);
                    onClose();
                  }}
                  profile={profile}
                />
              ))}
              <Text style={[styles.privacyNote, { color: theme.mutedText }]}>
                Only people you are permitted to view are shown. Circle membership does not automatically grant health-data access.
              </Text>
            </SheetSection>

            <SheetSection title="Circle actions">
              <ActionRow icon={<UsersRound color={theme.primary} size={20} />} label="Open Circle" onPress={() => openRoute("/(tabs)/circle" as Href)} />
              <ActionRow icon={<CirclePlus color={theme.primary} size={20} />} label="Invite member" onPress={() => openRoute("/(tabs)/circle" as Href)} />
              <ActionRow icon={<CirclePlus color={theme.primary} size={20} />} label="Join Circle" onPress={() => openRoute("/scan-invite" as Href)} />
              <ActionRow icon={<CirclePlus color={theme.primary} size={20} />} label="Manage or create Circle" onPress={() => openRoute("/(tabs)/circle" as Href)} />
            </SheetSection>

            <SheetSection title="Account actions">
              <ActionRow icon={<UserRound color={theme.primary} size={20} />} label="My profile" onPress={() => openRoute("/settings/profile-contact" as Href)} />
              <ActionRow icon={<Settings color={theme.primary} size={20} />} label="App settings" onPress={() => openRoute("/settings" as Href)} />
              <ActionRow icon={<Settings color={theme.primary} size={20} />} label="Subscription" onPress={() => openRoute("/settings/subscription" as Href)} />
              <ActionRow icon={<HelpCircle color={theme.primary} size={20} />} label="Help and support" onPress={() => openRoute("/(tabs)/profile" as Href)} />
              <ActionRow danger icon={<LogOut color={theme.danger} size={20} />} label="Sign out" onPress={handleSignOut} />
            </SheetSection>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SheetSection({ children, title }: { children: React.ReactNode; title: string }) {
  const { theme } = useAppTheme();
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>{children}</View>;
}

function ProfileRow({ active, onPress, profile, trailingLabel }: { active: boolean; onPress: () => void | Promise<void>; profile: HealthProfile; trailingLabel?: string }) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${profile.displayName}, ${formatRelationship(profile)}, ${active ? "current view" : "switch view"}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: active ? theme.primarySoft : theme.surface, borderColor: active ? theme.primary : theme.border }, pressed ? styles.pressed : null]}
    >
      <AppAvatar imageUri={profile.avatarUrl} initials={getInitials(profile.displayName)} size={40} />
      <View style={styles.copy}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{profile.displayName}</Text>
        <Text style={[styles.rowMeta, { color: theme.mutedText }]}>{formatRelationship(profile)}</Text>
      </View>
      {trailingLabel ? <Text style={[styles.trailingLabel, { color: theme.primary }]}>{trailingLabel}</Text> : active ? <Check color={theme.primary} size={19} /> : <ChevronRight color={theme.mutedText} size={19} />}
    </Pressable>
  );
}

function ActionRow({ danger = false, icon, label, onPress }: { danger?: boolean; icon: React.ReactNode; label: string; onPress: () => void | Promise<void> }) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { borderColor: theme.border }, pressed ? styles.pressed : null]}>
      {icon}<Text style={[styles.actionLabel, { color: danger ? theme.danger : theme.text }]}>{label}</Text><ChevronRight color={theme.mutedText} size={19} />
    </Pressable>
  );
}

export function formatRelationship(profile: HealthProfile) {
  return profile.profileType === "self" ? "Me" : profile.profileType.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HS";
}

const styles = StyleSheet.create({
  actionLabel: { flex: 1, fontSize: 15, fontWeight: "800" },
  body: { gap: 24, padding: 18, paddingBottom: 28 },
  close: { alignItems: "center", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  copy: { flex: 1, minWidth: 0 },
  handle: { alignSelf: "center", borderRadius: 999, height: 4, marginTop: 10, width: 46 },
  header: { alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  modal: { flex: 1, justifyContent: "flex-end" },
  pressed: { opacity: 0.72 },
  privacyNote: { fontSize: 12, lineHeight: 18, paddingHorizontal: 4 },
  row: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: spacing.md, minHeight: 58, padding: 12 },
  rowLabel: { fontSize: 15, fontWeight: "900" },
  rowMeta: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  scrim: { backgroundColor: "rgba(15, 23, 42, 0.48)", ...StyleSheet.absoluteFill },
  section: { gap: 9 },
  sectionTitle: { fontSize: 16, fontWeight: "900" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, overflow: "hidden" },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  title: { fontSize: 22, fontWeight: "900" },
  trailingLabel: { fontSize: 12, fontWeight: "900" }
});
