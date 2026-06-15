import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MuscleFocusCard } from "@/components/fitness/muscle-map";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppIcon, AppSection } from "@/components/ui";
import {
  deactivateFitnessPlan,
  getActivePlanProgress,
  getFitnessHistory,
  getFitnessSummary,
  getMuscleBalanceSummary,
  type ActivePlanProgress,
  type FitnessHistoryEvent,
  type FitnessHistorySummary,
} from "@/services/fitnessHistoryService";
import type { MuscleScoreMap } from "@/components/fitness/muscle-map";
import { useAppTheme } from "@/theme/ThemeProvider";

type Range = 7 | 30 | 90 | undefined;
const RANGES: Array<{ label: string; value: Range }> = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }, { label: "All", value: undefined }];

export default function FitnessHistoryScreen() {
  const { theme } = useAppTheme();
  const [range, setRange] = useState<Range>(30);
  const [history, setHistory] = useState<FitnessHistoryEvent[]>([]);
  const [summary, setSummary] = useState<FitnessHistorySummary | null>(null);
  const [plans, setPlans] = useState<ActivePlanProgress[]>([]);
  const [muscleScores, setMuscleScores] = useState<MuscleScoreMap>({});
  const [muscleLabels, setMuscleLabels] = useState({ needsAttention: "Build a balanced week", recoveryAttention: "No high recent load", workedMost: "No muscle history yet" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pendingDeactivate, setPendingDeactivate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextHistory, nextSummary, nextPlans, muscle] = await Promise.all([getFitnessHistory(range), getFitnessSummary(range), getActivePlanProgress(), getMuscleBalanceSummary(range ?? 3650)]);
      setHistory(nextHistory); setSummary(nextSummary); setPlans(nextPlans); setMuscleScores(muscle.scores); setMuscleLabels(muscle);
    } catch {
      setMessage("Some synced fitness history is unavailable. Showing available local workout history.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useFocusEffect(useCallback(() => { load().catch(() => setLoading(false)); }, [load]));

  async function deactivate(planId: string) {
    setPendingDeactivate("");
    const result = await deactivateFitnessPlan(planId, { removeFutureEvents: true });
    setMessage(result.error ? "Could not deactivate this plan." : "Plan deactivated. Future generated calendar events were removed.");
    await load();
  }

  const isEmpty = !loading && !history.length && !plans.length;
  return <AppMainLayout subtitle="Track what you did, what improved, and what needs recovery." title="Fitness History">
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>{RANGES.map((item) => <AppChip key={item.label} label={item.label} onPress={() => setRange(item.value)} selected={range === item.value} />)}</ScrollView>
    {loading ? <StateCard text="Loading fitness history..." /> : null}
    {message ? <StateCard text={message} /> : null}
    {pendingDeactivate ? <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}><Text style={[styles.cardTitle, { color: theme.text }]}>Pause and deactivate this plan?</Text><Text style={[styles.body, { color: theme.mutedText }]}>Future generated calendar events will be removed. Past history remains.</Text><View style={styles.actions}><AppButton onPress={() => deactivate(pendingDeactivate)} size="sm" title="Confirm deactivate" variant="danger" /><AppButton onPress={() => setPendingDeactivate("")} size="sm" title="Keep active" variant="secondary" /></View></AppCard> : null}
    {isEmpty ? <EmptyHistory /> : <>
      <AppSection title="Progress summary" />
      <View style={styles.stats}><Stat label="Completed" value={String(summary?.workoutsCompleted ?? 0)} /><Stat label="Skipped" value={String(summary?.workoutsSkipped ?? 0)} /><Stat label="Active plans" value={String(summary?.activePlans ?? 0)} /><Stat label="Weekly streak" value={`${summary?.weeklyStreak ?? 0} days`} /><Stat label="Most trained" value={summary?.mostTrainedMuscles ?? "None yet"} /><Stat label="Recovery attention" value={summary?.recoveryAttention ?? "Balanced"} /><Stat label="Goal progress" value={`${summary?.goalProgress ?? 0}%`} /></View>
      <AppSection title="Muscle Balance" subtitle="Recent load from available workout history." />
      <MuscleFocusCard mode="history" muscleScores={muscleScores} title="Muscle Balance" />
      <AppCard style={styles.insightCard}><Text style={[styles.insight, { color: theme.text }]}>Worked most: {muscleLabels.workedMost}</Text><Text style={[styles.insight, { color: theme.mutedText }]}>Needs attention: {muscleLabels.needsAttention}</Text><Text style={[styles.insight, { color: theme.warning }]}>Recovery attention: {muscleLabels.recoveryAttention}</Text><AppButton onPress={() => router.push("/fitness/body-map" as Href)} size="sm" title="View full body map" variant="secondary" /></AppCard>
      {plans.length ? <><AppSection title="Active plan progress" /><View style={styles.stack}>{plans.map((plan) => <PlanProgress key={plan.id} onDeactivate={() => setPendingDeactivate(plan.id)} plan={plan} />)}</View></> : null}
      <AppSection title="Goal progress" />
      <AppCard style={[styles.goalCard, { borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {summary?.goalProgress ? `${summary.goalProgress}% average active-plan progress` : "No saved goal progress yet"}
        </Text>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          Start a safe step-by-step goal path to track your starting point, target, and next recommended step here.
        </Text>
        <AppButton onPress={() => router.push("/fitness/goals" as Href)} size="sm" title="Browse goal paths" variant="secondary" />
      </AppCard>
      <AppSection title="Timeline" subtitle="Newest fitness activity first." />
      <View style={styles.stack}>{history.map((event) => <TimelineRow event={event} key={event.id} />)}</View>
      <RecoveryCard workedMost={muscleLabels.workedMost} needsAttention={muscleLabels.needsAttention} />
    </>}
  </AppMainLayout>;
}

function PlanProgress({ onDeactivate, plan }: { onDeactivate: () => void; plan: ActivePlanProgress }) {
  const { theme } = useAppTheme();
  return <AppCard style={[styles.plan, { borderColor: theme.border }]}><Text style={[styles.cardTitle, { color: theme.text }]}>{plan.title}</Text><Text style={[styles.body, { color: theme.mutedText }]}>Day {plan.currentDay} of {plan.totalDays || "—"} · {plan.completedDays} completed · {plan.missedDays} skipped</Text>{plan.nextWorkout ? <Text style={[styles.meta, { color: theme.mutedText }]}>Upcoming: {new Date(plan.nextWorkout).toLocaleString()}</Text> : null}<View style={[styles.track, { backgroundColor: theme.primarySoft }]}><View style={[styles.fill, { backgroundColor: theme.primary, width: `${plan.progress}%` }]} /></View><Text style={[styles.meta, { color: theme.primary }]}>{plan.progress}% complete</Text><View style={styles.actions}><AppButton onPress={() => router.push(`/fitness/program/${plan.sourceProgramId}` as Href)} size="sm" title="View plan" /><AppButton onPress={onDeactivate} size="sm" title="Pause / deactivate" variant="secondary" /><AppButton onPress={() => router.push("/calendar" as Href)} size="sm" title="View calendar" variant="ghost" /></View></AppCard>;
}

function TimelineRow({ event }: { event: FitnessHistoryEvent }) {
  const { theme } = useAppTheme();
  return <AppCard style={[styles.timeline, { borderColor: theme.border }]}><View style={[styles.timelineIcon, { backgroundColor: theme.primarySoft }]}><AppIcon color={theme.primary} decorative name={eventIcon(event.eventType)} size={18} /></View><View style={styles.timelineCopy}><View style={styles.timelineTop}><Text style={[styles.cardTitle, { color: theme.text }]}>{event.title}</Text><Text style={[styles.badge, { color: theme.primary }]}>{event.eventType.replace(/_/g, " ")}</Text></View><Text style={[styles.meta, { color: theme.mutedText }]}>{new Date(event.createdAt).toLocaleString()}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{event.description}</Text>{event.relatedProgramId ? <Pressable onPress={() => router.push(`/fitness/program/${event.relatedProgramId}` as Href)}><Text style={[styles.link, { color: theme.primary }]}>View plan</Text></Pressable> : null}</View></AppCard>;
}

function RecoveryCard({ needsAttention, workedMost }: { needsAttention: string; workedMost: string }) {
  const { theme } = useAppTheme();
  return <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}><Text style={[styles.cardTitle, { color: theme.text }]}>Recovery insights</Text><Text style={[styles.body, { color: theme.mutedText }]}>You trained {workedMost} most in this range. Consider {needsAttention} or mobility next.</Text><Text style={[styles.body, { color: theme.warning }]}>General guidance: adjust to your body. If you feel pain or unusual symptoms, rest and seek professional advice where needed.</Text></AppCard>;
}
function EmptyHistory() { return <AppCard style={styles.empty}><AppIcon decorative name="fitness" size={30} /><Text style={styles.emptyTitle}>Your fitness history will appear here after you complete workouts or activate a plan.</Text><View style={styles.actions}><AppButton onPress={() => router.push("/fitness/programs" as Href)} size="sm" title="Browse programs" /><AppButton onPress={() => router.push("/fitness/library" as Href)} size="sm" title="Open exercise library" variant="secondary" /><AppButton onPress={() => router.push("/fitness" as Href)} size="sm" title="Start quick workout" variant="ghost" /></View></AppCard>; }
function StateCard({ text }: { text: string }) { const { theme } = useAppTheme(); return <AppCard variant="soft"><Text style={{ color: theme.text, fontWeight: "800" }}>{text}</Text></AppCard>; }
function Stat({ label, value }: { label: string; value: string }) { const { theme } = useAppTheme(); return <AppCard style={styles.stat}><Text style={[styles.statLabel, { color: theme.mutedText }]}>{label}</Text><Text style={[styles.statValue, { color: theme.text }]} numberOfLines={2}>{value}</Text></AppCard>; }
function eventIcon(type: string): "fitness" | "planning" | "success" | "warning" { if (type.includes("activated") || type.includes("plan")) return "planning"; if (type.includes("skipped") || type.includes("warning")) return "warning"; if (type.includes("completed")) return "success"; return "fitness"; }
const styles = StyleSheet.create({ actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, badge: { fontSize: 9, fontWeight: "900", textTransform: "uppercase" }, body: { fontSize: 12, lineHeight: 18, marginTop: 4 }, cardTitle: { flex: 1, fontSize: 16, fontWeight: "900" }, empty: { alignItems: "center", gap: 12 }, emptyTitle: { fontSize: 16, fontWeight: "900", lineHeight: 23, textAlign: "center" }, fill: { borderRadius: 999, height: "100%" }, goalCard: { borderWidth: 1, gap: 10 }, insight: { fontSize: 12, fontWeight: "800", lineHeight: 18 }, insightCard: { gap: 4 }, link: { fontSize: 11, fontWeight: "900", marginTop: 8 }, meta: { fontSize: 10, fontWeight: "800", marginTop: 4 }, plan: { borderWidth: 1 }, rail: { gap: 7, paddingRight: 12 }, stack: { gap: 10 }, stat: { flexBasis: "30%", flexGrow: 1, minHeight: 100 }, statLabel: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" }, stats: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, statValue: { fontSize: 16, fontWeight: "900", marginTop: 8 }, timeline: { alignItems: "flex-start", borderWidth: 1, flexDirection: "row", gap: 11 }, timelineCopy: { flex: 1 }, timelineIcon: { alignItems: "center", borderRadius: 14, height: 38, justifyContent: "center", width: 38 }, timelineTop: { alignItems: "flex-start", flexDirection: "row", gap: 8 }, track: { borderRadius: 999, height: 7, marginTop: 12, overflow: "hidden" } });
