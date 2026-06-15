import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppChip, AppIcon } from "@/components/ui";
import {
  EXERCISE_EQUIPMENT,
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  WORKOUT_DIFFICULTIES,
  formatWorkoutLabel,
} from "@/constants/workoutLibrary";
import {
  getExercises,
  normalizeExerciseContent,
  type FitnessExerciseContent,
} from "@/services/fitnessContentService";
import { useAppTheme } from "@/theme/ThemeProvider";

const PRIMARY_FILTERS = [
  "All", "Strength", "Cardio", "Running", "Yoga", "Pilates", "Mobility",
  "Stretching", "Pregnancy-safe", "Postpartum", "Kids", "Teens",
  "No equipment", "Gym", "Recovery", "Advanced",
];
const AUDIENCES = ["All", "Adults", "Pregnancy", "Postpartum", "Kids", "Teens"];

export default function ExerciseLibraryScreen() {
  const { theme } = useAppTheme();
  const [liveExercises, setLiveExercises] = useState<FitnessExerciseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState("All");
  const [audience, setAudience] = useState("All");
  const [level, setLevel] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [muscle, setMuscle] = useState("All");

  useEffect(() => {
    let mounted = true;
    getExercises()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data?.length) {
          setOffline(Boolean(error));
          setLiveExercises([]);
          return;
        }
        setLiveExercises(data.map((row) => normalizeExerciseContent(row)));
      })
      .catch(() => mounted && setOffline(true))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const source = liveExercises.length
    ? liveExercises
    : EXERCISE_LIBRARY.map((item) => normalizeExerciseContent(item));
  const results = useMemo(
    () =>
      source.filter((exercise) => {
        const haystack = [
          exercise.name, exercise.description, exercise.category,
          ...exercise.equipment, ...exercise.primaryMuscles,
          ...exercise.secondaryMuscles, ...exercise.goalTags,
          ...exercise.audience, ...exercise.location,
        ].join(" ").toLowerCase();
        return (
          (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
          matchesPrimary(exercise, primaryFilter) &&
          matchesValue(exercise.audience, audience) &&
          (level === "All" || exercise.level.toLowerCase() === level.toLowerCase()) &&
          matchesValue(exercise.equipment, equipment) &&
          matchesValue([...exercise.primaryMuscles, ...exercise.secondaryMuscles], muscle)
        );
      }),
    [audience, equipment, level, muscle, primaryFilter, query, source],
  );

  return (
    <AppMainLayout
      scroll={false}
      screenStyle={styles.screen}
      subtitle="Find movements by goal, muscle, equipment or level."
      title="Exercise Library"
    >
      <FlatList
        contentContainerStyle={styles.list}
        data={results}
        initialNumToRender={10}
        keyExtractor={(item) => item.exerciseId}
        maxToRenderPerBatch={12}
        removeClippedSubviews
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        windowSize={7}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <AppIcon color={theme.mutedText} decorative name="search" size={19} />
              <TextInput
                onChangeText={setQuery}
                placeholder="Search exercises, muscles or equipment"
                placeholderTextColor={theme.mutedText}
                style={[styles.searchInput, { color: theme.text }]}
                value={query}
              />
            </View>
            <FilterRail items={PRIMARY_FILTERS} onSelect={setPrimaryFilter} selected={primaryFilter} />
            <Text style={[styles.filterTitle, { color: theme.mutedText }]}>Refine results</Text>
            <FilterGroup label="Audience" items={AUDIENCES} onSelect={setAudience} selected={audience} />
            <FilterGroup label="Level" items={["All", ...WORKOUT_DIFFICULTIES.map(formatWorkoutLabel)]} onSelect={setLevel} selected={level} />
            <FilterGroup label="Equipment" items={["All", ...EXERCISE_EQUIPMENT.map(formatWorkoutLabel)]} onSelect={setEquipment} selected={equipment} />
            <FilterGroup label="Muscle group" items={["All", ...MUSCLE_GROUPS.map(formatWorkoutLabel)]} onSelect={setMuscle} selected={muscle} />
            {loading ? <StateCard text="Loading exercise library..." /> : null}
            {!loading && offline ? <StateCard text="Live exercises are unavailable. Showing the built-in exercise library." warning /> : null}
            <Text style={[styles.resultCount, { color: theme.mutedText }]}>{results.length} exercises</Text>
          </View>
        }
        ListEmptyComponent={!loading ? <StateCard text="No exercises found. Try changing filters." /> : null}
      />
    </AppMainLayout>
  );
}

function ExerciseCard({ exercise }: { exercise: FitnessExerciseContent }) {
  const { theme } = useAppTheme();
  const safetyBadge = getSafetyBadge(exercise);
  return (
    <AppCard style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon color={theme.primary} decorative name="fitness" size={22} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{exercise.name}</Text>
          <Text style={[styles.cardBody, { color: theme.mutedText }]} numberOfLines={2}>{exercise.description}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <SmallPill label={formatWorkoutLabel(exercise.category)} />
        <SmallPill label={formatWorkoutLabel(exercise.level)} />
        <SmallPill label={exercise.equipment.slice(0, 2).map(formatWorkoutLabel).join(" + ") || "No equipment"} />
      </View>
      <Text style={[styles.muscles, { color: theme.mutedText }]}>
        Main muscles: {exercise.primaryMuscles.map(formatWorkoutLabel).join(", ") || "General movement"}
      </Text>
      <View style={styles.cardFooter}>
        {safetyBadge ? <Text style={[styles.safetyBadge, { color: theme.warning }]}>{safetyBadge}</Text> : <View />}
        <Pressable onPress={() => router.push(`/fitness/exercise/${exercise.exerciseId}` as Href)} style={[styles.open, { backgroundColor: theme.primary }]}>
          <Text style={styles.openText}>Open</Text>
        </Pressable>
      </View>
    </AppCard>
  );
}

function FilterRail({ items, onSelect, selected }: { items: string[]; onSelect: (value: string) => void; selected: string }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>{items.map((item) => <AppChip key={item} label={item} onPress={() => onSelect(item)} selected={selected === item} />)}</ScrollView>;
}

function FilterGroup({ items, label, onSelect, selected }: { items: string[]; label: string; onSelect: (value: string) => void; selected: string }) {
  const { theme } = useAppTheme();
  return <View style={styles.filterGroup}><Text style={[styles.filterLabel, { color: theme.text }]}>{label}</Text><FilterRail items={items} onSelect={onSelect} selected={selected} /></View>;
}

function StateCard({ text, warning = false }: { text: string; warning?: boolean }) {
  const { theme } = useAppTheme();
  return <AppCard variant={warning ? "warning" : "soft"}><Text style={{ color: warning ? theme.warning : theme.text, fontWeight: "800", lineHeight: 20 }}>{text}</Text></AppCard>;
}

function SmallPill({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return <View style={[styles.smallPill, { backgroundColor: theme.primarySoft }]}><Text style={[styles.smallPillText, { color: theme.primary }]}>{label}</Text></View>;
}

function matchesValue(values: string[], selected: string) {
  return selected === "All" || values.some((value) => value.toLowerCase().includes(selected.toLowerCase()));
}

function matchesPrimary(exercise: FitnessExerciseContent, selected: string) {
  if (selected === "All") return true;
  const value = selected.toLowerCase();
  const haystack = [
    exercise.name,
    exercise.description,
    exercise.category,
    exercise.level,
    ...exercise.goalTags,
    ...exercise.audience,
    ...exercise.equipment,
    ...exercise.location,
    ...exercise.primaryMuscles,
    ...exercise.secondaryMuscles,
  ].join(" ").toLowerCase();
  if (value === "no equipment") return exercise.equipment.some((item) => ["none", "bodyweight"].includes(item.toLowerCase()));
  if (value === "pregnancy-safe") return haystack.includes("pregnan");
  return haystack.includes(value.replace("-", " "));
}

function getSafetyBadge(exercise: FitnessExerciseContent) {
  const value = [...exercise.audience, exercise.category, exercise.level, ...exercise.safetyNotes].join(" ").toLowerCase();
  if (value.includes("pregnan")) return "Pregnancy: general guidance";
  if (value.includes("postpartum")) return "Postpartum: general guidance";
  if (value.includes("child") || value.includes("kid")) return "Age-aware guidance";
  if (value.includes("teen")) return "Teen guidance";
  if (value.includes("injur")) return "Injury-conscious";
  if (value.includes("advanced")) return "Advanced caution";
  return undefined;
}

const styles = StyleSheet.create({
  card: { gap: 13 },
  cardBody: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  cardCopy: { flex: 1 },
  cardFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  cardIcon: { alignItems: "center", borderRadius: 16, height: 46, justifyContent: "center", width: 46 },
  cardTitle: { fontSize: 17, fontWeight: "900" },
  cardTop: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  filterGroup: { gap: 7 },
  filterLabel: { fontSize: 12, fontWeight: "900" },
  filterTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 0.9, textTransform: "uppercase" },
  header: { gap: 13, marginBottom: 16 },
  list: { gap: 12, paddingBottom: 180 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  muscles: { fontSize: 11, fontWeight: "700" },
  open: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  openText: { color: "#10201d", fontSize: 11, fontWeight: "900" },
  rail: { gap: 7, paddingRight: 12 },
  resultCount: { fontSize: 12, fontWeight: "800" },
  safetyBadge: { fontSize: 10, fontWeight: "900", flex: 1 },
  screen: { flex: 1 },
  search: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 50, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 14, minHeight: 48 },
  smallPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  smallPillText: { fontSize: 10, fontWeight: "900" },
});
