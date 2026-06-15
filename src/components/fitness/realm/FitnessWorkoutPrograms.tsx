import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import {
  FITNESS_WORKOUT_PROGRAMS,
  type FitnessWorkoutProgram,
} from "@/constants/fitnessRealmConfig";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FitnessWorkoutPrograms({
  onSelect,
  onViewAll,
  programs = FITNESS_WORKOUT_PROGRAMS,
}: {
  onSelect: (program: FitnessWorkoutProgram) => void;
  onViewAll?: () => void;
  programs?: FitnessWorkoutProgram[];
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>Plans that fit real life</Text>
          <Text style={[styles.heading, { color: theme.text }]}>Workout Programs</Text>
        </View>
        {onViewAll ? <Pressable onPress={onViewAll}><Text style={[styles.viewAll, { color: theme.primary }]}>View all</Text></Pressable> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {programs.map((program) => (
          <Pressable
            key={program.id}
            onPress={() => onSelect(program)}
            style={[styles.card, { backgroundColor: theme.card ?? theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.accent, { backgroundColor: program.accentColor }]} />
            <View style={styles.topRow}>
              <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
                <AppIcon color={program.accentColor} decorative name="fitness" size={20} />
              </View>
              <Text style={[styles.duration, { color: theme.mutedText }]}>{program.duration}</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{program.title}</Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>{program.subtitle}</Text>
            {program.safetyBadge ? (
              <Text style={[styles.badge, { color: theme.warning }]}>{program.safetyBadge}</Text>
            ) : null}
            <Text style={[styles.open, { color: theme.primary }]}>Preview program</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  accent: { borderRadius: 999, height: 4, left: 16, position: "absolute", right: 16, top: 0 },
  badge: { fontSize: 9, fontWeight: "900", marginTop: 8, textTransform: "uppercase" },
  card: { borderRadius: 22, borderWidth: 1, minHeight: 190, overflow: "hidden", padding: 16, width: 215 },
  duration: { fontSize: 10, fontWeight: "800" },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 0.9, textTransform: "uppercase" },
  heading: { fontSize: 22, fontWeight: "900", marginTop: 3 },
  headingRow: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  icon: { alignItems: "center", borderRadius: 14, height: 40, justifyContent: "center", width: 40 },
  open: { fontSize: 11, fontWeight: "900", marginTop: "auto" },
  rail: { gap: 11, paddingRight: 16 },
  section: { gap: 12 },
  subtitle: { fontSize: 12, lineHeight: 17, marginTop: 6 },
  title: { fontSize: 17, fontWeight: "900", lineHeight: 22, marginTop: 15 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  viewAll: { fontSize: 11, fontWeight: "900", paddingVertical: 6 },
});
