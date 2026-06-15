import { StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { FITNESS_SAFETY_NOTES } from "@/constants/fitnessRealmConfig";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FitnessSafetyRecoveryCard() {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.card, { backgroundColor: theme.card ?? theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <AppIcon color="#fef3c7" decorative name="safety" size={22} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.warning }]}>Safety + recovery</Text>
          <Text style={[styles.title, { color: theme.text }]}>Train for the body you have today</Text>
        </View>
      </View>
      <Text style={[styles.body, { color: theme.mutedText }]}>
        Fitness content is general guidance, not medical treatment or
        rehabilitation advice. Seek professional advice when needed.
      </Text>
      <View style={styles.notes}>
        {FITNESS_SAFETY_NOTES.slice(0, 6).map((note) => (
          <View key={note.id} style={[styles.note, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.noteTitle, { color: theme.text }]}>{note.title}</Text>
            <Text style={[styles.noteBody, { color: theme.mutedText }]}>{note.guidance}</Text>
          </View>
        ))}
      </View>
      <View style={styles.recovery}>
        <AppIcon color="#fdba74" decorative name="health" size={20} />
        <Text style={styles.recoveryText}>
          Recovery idea: try 8 minutes of gentle mobility and stop if anything
          feels wrong.
        </Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  body: { color: "#cbd5e1", fontSize: 12, lineHeight: 18 },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    gap: 14,
  },
  eyebrow: {
    color: "#fbbf24",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  header: { alignItems: "center", flexDirection: "row", gap: 11 },
  headerCopy: { flex: 1 },
  icon: {
    alignItems: "center",
    backgroundColor: "#92400e",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  note: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    gap: 2,
    padding: 10,
  },
  noteBody: { color: "#94a3b8", fontSize: 10, lineHeight: 15 },
  noteTitle: { color: "#f8fafc", fontSize: 11, fontWeight: "900" },
  notes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recovery: {
    alignItems: "center",
    backgroundColor: "rgba(249,115,22,0.12)",
    borderRadius: 16,
    flexDirection: "row",
    gap: 9,
    padding: 11,
  },
  recoveryText: {
    color: "#fed7aa",
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },
  title: { color: "#f8fafc", fontSize: 18, fontWeight: "900", marginTop: 3 },
});
