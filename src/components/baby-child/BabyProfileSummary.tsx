import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { BabyChildProfile } from "@/types/child";

export function BabyProfileSummary({
  isCaregiverView,
  onSelectProfile,
  profile,
  profiles,
}: {
  isCaregiverView: boolean;
  onSelectProfile: (id: string) => void;
  profile: BabyChildProfile;
  profiles: BabyChildProfile[];
}) {
  const { theme } = useAppTheme();
  const initials = profile.displayName.trim().slice(0, 2).toUpperCase() || "BB";

  return (
    <AppCard
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.profileRow}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primarySoft, borderColor: theme.primary },
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.text }]}>
            {profile.avatarEmoji || initials}
          </Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={[styles.name, { color: theme.text }]}>
            {profile.displayName}
          </Text>
          <Text style={[styles.meta, { color: theme.mutedText }]}>
            {formatAge(profile.dateOfBirth)}
            {profile.dateOfBirth
              ? ` · Born ${formatDate(profile.dateOfBirth)}`
              : ""}
          </Text>
          <View style={styles.badgeRow}>
            <View
              style={[styles.badge, { backgroundColor: theme.primarySoft }]}
            >
              <AppIcon
                color={theme.primary}
                decorative
                name="baby_child"
                size={14}
              />
              <Text style={[styles.badgeText, { color: theme.text }]}>
                {isCaregiverView ? "Caregiver view" : "Parent view"}
              </Text>
            </View>
            <View
              style={[styles.badge, { backgroundColor: theme.primarySoft }]}
            >
              <AppIcon
                color={theme.primary}
                decorative
                name="privacy"
                size={14}
              />
              <Text style={[styles.badgeText, { color: theme.text }]}>
                {profile.privacy === "shared_selected"
                  ? "Shared selected"
                  : "Private"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.switcherHeading}>
        <Text style={[styles.switcherTitle, { color: theme.text }]}>
          Child profiles
        </Text>
        <Text style={[styles.switcherMeta, { color: theme.mutedText }]}>
          Parent-controlled care view
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorRow}
      >
        {profiles.map((item) => {
          const selected = item.id === profile.id;
          const itemInitials =
            item.displayName.trim().slice(0, 2).toUpperCase() || "CH";
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.id}
              onPress={() => onSelectProfile(item.id)}
              style={[
                styles.selector,
                {
                  backgroundColor: selected ? theme.primarySoft : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.selectorAvatar,
                  {
                    backgroundColor: selected
                      ? theme.surface
                      : theme.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[styles.selectorAvatarText, { color: theme.text }]}
                >
                  {item.avatarEmoji || itemInitials}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[styles.selectorText, { color: theme.text }]}
              >
                {item.displayName}
              </Text>
              <Text
                style={[
                  styles.selectorStatus,
                  { color: selected ? theme.primary : theme.mutedText },
                ]}
              >
                {selected ? "Viewing" : formatAge(item.dateOfBirth)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </AppCard>
  );
}

function getAgeMonths(dateOfBirth?: string) {
  if (!dateOfBirth) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 2629800000),
  );
}

function formatAge(dateOfBirth?: string) {
  if (!dateOfBirth) return "Age not added";
  const months = getAgeMonths(dateOfBirth);
  if (months < 2)
    return `${Math.max(0, Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 604800000))} weeks old`;
  if (months < 24) return `${months} months old`;
  return `${Math.floor(months / 12)} years old`;
}

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric" },
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 36,
    borderWidth: 2,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  avatarText: { fontSize: 22, fontWeight: "900" },
  badge: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  card: { borderWidth: 1 },
  meta: { lineHeight: 20, marginTop: 3 },
  name: { fontSize: 27, fontWeight: "900" },
  profileCopy: { flex: 1 },
  profileRow: { alignItems: "center", flexDirection: "row", gap: 14 },
  selector: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    minHeight: 116,
    padding: 12,
    width: 132,
  },
  selectorAvatar: {
    alignItems: "center",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  selectorAvatarText: { fontSize: 15, fontWeight: "900" },
  selectorRow: { gap: 10, paddingRight: 12 },
  selectorStatus: { fontSize: 10, fontWeight: "800" },
  selectorText: { fontSize: 13, fontWeight: "900", maxWidth: 108 },
  switcherHeading: { marginTop: 18, marginBottom: 10 },
  switcherMeta: { fontSize: 11, marginTop: 3 },
  switcherTitle: { fontSize: 15, fontWeight: "900" },
});
