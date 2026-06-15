import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppIcon } from "@/components/ui";
import { FITNESS_WORKOUT_PROGRAMS, type FitnessWorkoutProgram } from "@/constants/fitnessRealmConfig";
import { getWorkoutPrograms, normalizeProgramContent, type FitnessProgramContent } from "@/services/fitnessContentService";
import { useAppTheme } from "@/theme/ThemeProvider";

const FILTERS = ["All", "7 day", "28 day", "Strength", "Weight loss", "Muscle gain", "Home", "Gym", "Running", "Pregnancy-safe", "Postpartum", "Recovery", "Beginner", "Advanced"];

export default function ProgramsScreen() {
  const { theme } = useAppTheme();
  const [filter, setFilter] = useState("All");
  const [live, setLive] = useState<FitnessProgramContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    getWorkoutPrograms().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data?.length) setOffline(Boolean(error));
      else setLive(data.map((row) => normalizeProgramContent(row)));
    }).catch(() => mounted && setOffline(true)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const source = live.length ? live : FITNESS_WORKOUT_PROGRAMS.map(programFromFallback);
  const programs = useMemo(() => source.filter((program) => filter === "All" || programHaystack(program).includes(filter.toLowerCase().replace("-", " "))), [filter, source]);

  return (
    <AppMainLayout scroll={false} screenStyle={styles.screen} subtitle="Choose a guided plan that fits your goal, time and body." title="Workout Programs">
      <FlatList
        contentContainerStyle={styles.list}
        data={programs}
        initialNumToRender={8}
        keyExtractor={(item) => item.programId}
        renderItem={({ item }) => <ProgramCard program={item} />}
        ListHeaderComponent={<View style={styles.header}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>{FILTERS.map((item) => <AppChip key={item} label={item} onPress={() => setFilter(item)} selected={filter === item} />)}</ScrollView>{loading ? <StateCard text="Loading workout programs..." /> : null}{!loading && offline ? <StateCard text="Live programs are unavailable. Showing built-in plans." warning /> : null}<Text style={{ color: theme.mutedText, fontSize: 12, fontWeight: "800" }}>{programs.length} plans</Text></View>}
        ListEmptyComponent={!loading ? <StateCard text="No programs found. Try changing filters." /> : null}
      />
    </AppMainLayout>
  );
}

export function programFromFallback(program: FitnessWorkoutProgram): FitnessProgramContent {
  return { audience: [program.audience ?? "Adults"], averageMinutes: program.averageMinutes ?? 30, days: program.days ?? 7, daysPerWeek: program.daysPerWeek ?? 3, description: program.subtitle, equipment: program.equipment ?? [], focus: program.focus ?? [], goal: program.goal ?? "General fitness", level: program.level ?? "Beginner", programId: program.id, recoveryDays: program.recoveryDays ?? "Include lighter or rest days", title: program.title };
}

export function ProgramCard({ program }: { program: FitnessProgramContent }) {
  const { theme } = useAppTheme();
  const safety = safetyBadge(program);
  return <AppCard style={[styles.card, { borderColor: theme.border }]}>
    <View style={styles.top}><View style={[styles.icon, { backgroundColor: theme.primarySoft }]}><AppIcon color={theme.primary} decorative name="planning" size={23} /></View><View style={styles.copy}><Text style={[styles.title, { color: theme.text }]}>{program.title}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{program.description}</Text></View></View>
    <View style={styles.chips}><Chip label={`${program.days} days`} /><Chip label={program.level} /><Chip label={program.goal} /></View>
    <Text style={[styles.meta, { color: theme.mutedText }]}>Audience: {program.audience.join(", ") || "Adults"} · Equipment: {program.equipment.join(", ") || "None"}</Text>
    <Text style={[styles.meta, { color: theme.mutedText }]}>{program.daysPerWeek} days/week · ~{program.averageMinutes} min · {program.focus.join(", ") || "Balanced movement"}</Text>
    {safety ? <Text style={[styles.safety, { color: theme.warning }]}>{safety}</Text> : null}
    <AppButton onPress={() => router.push(`/fitness/program/${program.programId}` as Href)} size="sm" title="View plan" />
  </AppCard>;
}

function Chip({ label }: { label: string }) { const { theme } = useAppTheme(); return <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}><Text style={{ color: theme.primary, fontSize: 10, fontWeight: "900" }}>{label}</Text></View>; }
function StateCard({ text, warning = false }: { text: string; warning?: boolean }) { const { theme } = useAppTheme(); return <AppCard variant={warning ? "warning" : "soft"}><Text style={{ color: warning ? theme.warning : theme.text, fontWeight: "800" }}>{text}</Text></AppCard>; }
function programHaystack(program: FitnessProgramContent) { return [program.title, program.description, program.goal, program.level, program.days === 7 ? "7 day" : "", program.days === 28 ? "28 day" : "", ...program.audience, ...program.equipment, ...program.focus].join(" ").toLowerCase(); }
function safetyBadge(program: FitnessProgramContent) { const value = programHaystack(program); if (value.includes("pregnan") || value.includes("postpartum") || value.includes("injur")) return "General guidance · seek professional advice when needed"; if (value.includes("advanced") || value.includes("high intensity")) return "Advanced training caution"; return undefined; }

const styles = StyleSheet.create({
  body: { fontSize: 12, lineHeight: 18, marginTop: 4 }, card: { borderWidth: 1, gap: 12 }, chip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, copy: { flex: 1 }, header: { gap: 13, marginBottom: 16 }, icon: { alignItems: "center", borderRadius: 16, height: 48, justifyContent: "center", width: 48 }, list: { gap: 12, paddingBottom: 180 }, meta: { fontSize: 11, fontWeight: "700", lineHeight: 17 }, rail: { gap: 7, paddingRight: 12 }, safety: { fontSize: 10, fontWeight: "900" }, screen: { flex: 1 }, title: { fontSize: 18, fontWeight: "900" }, top: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
});
