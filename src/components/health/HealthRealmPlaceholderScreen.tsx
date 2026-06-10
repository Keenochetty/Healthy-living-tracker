import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppCard, AppIcon } from "@/components/ui";
import type { HealthRealm, HealthRealmPreview } from "@/lib/healthRealms";
import { useAppTheme } from "@/theme/ThemeProvider";

export function HealthRealmPlaceholderScreen({ realm }: { realm: HealthRealm }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const stackedPreviews = width < 400;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 120, paddingTop: Math.max(insets.top, 14) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityHint="Returns to the Health overview" accessibilityLabel="Back to Health" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
            <Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text>
          </Pressable>
          <View style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon color={realm.accent} decorative name="profile" size={17} />
            <View>
              <Text style={[styles.profileLabel, { color: theme.mutedText }]}>ACTIVE PROFILE</Text>
              <Text style={[styles.profileName, { color: theme.text }]}>You</Text>
            </View>
          </View>
        </View>

        <View accessible accessibilityLabel={`${realm.title}. ${realm.subtitle}`} style={[styles.hero, { backgroundColor: `${realm.accent}12`, borderColor: `${realm.accent}45` }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: `${realm.accent}20` }]}>
              <AppIcon color={realm.accent} decorative name={realm.icon} size={27} />
            </View>
            <View style={[styles.status, { backgroundColor: theme.surface, borderColor: `${realm.accent}35` }]}>
              <Text style={[styles.statusText, { color: realm.accent }]}>{realm.status}</Text>
            </View>
          </View>
          <Text style={[styles.eyebrow, { color: realm.accent }]}>{realm.eyebrow}</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{realm.title}</Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>{realm.subtitle}</Text>
          <View style={styles.motif}>
            {realm.previews.slice(0, 3).map((preview) => (
              <View key={preview.title} style={[styles.motifIcon, { backgroundColor: theme.surface, borderColor: `${realm.accent}30` }]}>
                <AppIcon color={realm.accent} decorative name={preview.icon} size={16} />
              </View>
            ))}
          </View>
        </View>

        <AppCard style={[styles.intro, { backgroundColor: theme.surface, borderColor: `${realm.accent}35` }]}>
          <View style={[styles.introMarker, { backgroundColor: realm.accent }]} />
          <View style={styles.introCopy}>
            <Text accessibilityRole="header" style={[styles.introTitle, { color: theme.text }]}>{realm.introTitle}</Text>
            <Text style={[styles.introText, { color: theme.mutedText }]}>{realm.description}</Text>
          </View>
        </AppCard>

        <View style={styles.previewSection}>
          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>Planned areas</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.mutedText }]}>A preview of what will live in this realm.</Text>
          </View>
          <View style={styles.grid}>
            {realm.previews.map((preview) => <RealmPreviewCard accent={realm.accent} key={preview.title} preview={preview} stacked={stackedPreviews} />)}
          </View>
        </View>

        <AppCard style={[styles.planned, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.plannedIcon, { backgroundColor: `${realm.accent}18` }]}>
            <AppIcon color={realm.accent} decorative name="reminder" size={20} />
          </View>
          <View style={styles.plannedCopy}>
            <Text style={[styles.plannedTitle, { color: theme.text }]}>Planned area</Text>
            <Text style={[styles.plannedText, { color: theme.mutedText }]}>Tracking and organizing actions are planned for a later phase.</Text>
          </View>
        </AppCard>

        {realm.safetyNote ? (
          <View accessible accessibilityLabel={`Health note: ${realm.safetyNote}`} style={[styles.note, { borderColor: `${realm.accent}40` }]}>
            <Text style={[styles.noteTitle, { color: realm.accent }]}>Health note</Text>
            <Text style={[styles.noteText, { color: theme.mutedText }]}>{realm.safetyNote}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function RealmPreviewCard({ accent, preview, stacked }: { accent: string; preview: HealthRealmPreview; stacked: boolean }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.preview, stacked ? styles.previewStacked : null, { backgroundColor: theme.surface, borderColor: `${accent}35` }]}>
      <View style={[styles.previewIcon, { backgroundColor: `${accent}18` }]}>
        <AppIcon color={accent} decorative name={preview.icon} size={21} />
      </View>
      <Text style={[styles.previewTitle, { color: theme.text }]}>{preview.title}</Text>
      <Text style={[styles.previewDescription, { color: theme.mutedText }]}>{preview.description}</Text>
      <View style={[styles.previewStatusBadge, { backgroundColor: `${accent}12` }]}>
        <Text style={[styles.previewStatus, { color: accent }]}>{preview.status}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "center", borderRadius: 16, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  backText: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  content: { alignSelf: "center", gap: 24, maxWidth: 480, paddingHorizontal: 18, width: "100%" },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  hero: { alignItems: "flex-start", borderRadius: 28, borderWidth: 1, padding: 20 },
  heroIcon: { alignItems: "center", borderRadius: 18, height: 50, justifyContent: "center", width: 50 },
  heroTop: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 16, width: "100%" },
  intro: { alignItems: "stretch", borderWidth: 1, flexDirection: "row", gap: 14, padding: 16 },
  introCopy: { flex: 1 },
  introMarker: { borderRadius: 999, width: 4 },
  introText: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  introTitle: { fontSize: 17, fontWeight: "900", lineHeight: 22 },
  motif: { flexDirection: "row", gap: 8, marginTop: 18 },
  motifIcon: { alignItems: "center", borderRadius: 13, borderWidth: 1, height: 34, justifyContent: "center", width: 34 },
  note: { borderLeftWidth: 3, paddingHorizontal: 14, paddingVertical: 4 },
  noteText: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  noteTitle: { fontSize: 13, fontWeight: "900" },
  planned: { alignItems: "center", borderWidth: 1, flexDirection: "row", gap: 12 },
  plannedCopy: { flex: 1 },
  plannedIcon: { alignItems: "center", borderRadius: 16, height: 42, justifyContent: "center", width: 42 },
  plannedText: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  plannedTitle: { fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.72 },
  preview: { borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 170 },
  previewSection: { gap: 14 },
  previewStacked: { flexBasis: "100%", minHeight: 150 },
  previewDescription: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  previewIcon: { alignItems: "center", borderRadius: 15, height: 40, justifyContent: "center", marginBottom: 12, width: 40 },
  previewStatus: { fontSize: 11, fontWeight: "900" },
  previewStatusBadge: { alignSelf: "flex-start", borderRadius: 999, marginTop: "auto", paddingHorizontal: 9, paddingVertical: 5 },
  previewTitle: { fontSize: 16, fontWeight: "900" },
  profile: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 44, paddingHorizontal: 12 },
  profileLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  profileName: { fontSize: 13, fontWeight: "900" },
  screen: { flex: 1 },
  sectionHeading: { gap: 5 },
  sectionSubtitle: { fontSize: 14, lineHeight: 21 },
  sectionTitle: { fontSize: 20, fontWeight: "900" },
  status: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  statusText: { fontSize: 12, fontWeight: "900" },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 7 },
  title: { fontSize: 28, fontWeight: "900", lineHeight: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }
});
