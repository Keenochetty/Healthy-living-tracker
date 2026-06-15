import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import { FITNESS_GOAL_FEATURES } from "@/constants/featurePreferenceConfig";
import { getFitnessGoalDetail } from "@/constants/fitnessGoalDetails";
import { FITNESS_WORKOUT_PROGRAMS } from "@/constants/fitnessRealmConfig";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import { getGoalProgressions } from "@/services/fitnessContentService";
import { getUserFeaturePreferences, shouldShowFeature } from "@/services/userFeaturePreferencesService";
import { useAppTheme } from "@/theme/ThemeProvider";
import { ProgramCard, programFromFallback } from "@/app/fitness/programs";

const STOP_GUIDANCE = "Stop for pain, dizziness, bleeding, unusual shortness of breath, or symptoms that feel unsafe. Seek professional advice when needed.";

export default function GoalDetailScreen() {
  const { theme } = useAppTheme();
  const { activeProfile } = useActiveProfile();
  const { goalId = "" } = useLocalSearchParams<{ goalId?: string }>();
  const goal = getFitnessGoalDetail(String(goalId));
  const [steps, setSteps] = useState(goal.progression ?? []);
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    getGoalProgressions(String(goalId)).then(({ data }) => {
      if (!mounted || !data?.length) return;
      setSteps(data.map((row, index) => ({ description: String(row.description ?? row.guidance ?? "Progress gradually and adjust to your body."), title: String(row.title ?? row.name ?? `Step ${index + 1}`) })));
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, [goalId]);

  useEffect(() => {
    getUserFeaturePreferences(activeProfile?.id).then((preferences) => {
      setEnabled(shouldShowFeature(FITNESS_GOAL_FEATURES[String(goalId)] ?? "fitness", { preferences, profileType: activeProfile?.profileType }));
    }).catch(() => undefined);
  }, [activeProfile?.id, activeProfile?.profileType, goalId]);

  const recommended = FITNESS_WORKOUT_PROGRAMS.filter((program) => [program.goal, program.title, program.subtitle].join(" ").toLowerCase().includes((goal.goalType ?? "").split(" ")[0].toLowerCase())).slice(0, 2);
  const fallbackRecommended = recommended.length ? recommended : FITNESS_WORKOUT_PROGRAMS.slice(0, 2);
  return <AppMainLayout subtitle="Safe step-by-step fitness progression" title={goal.title}>
    {!enabled ? <AppCard variant="soft"><Text style={{ color: theme.text, fontWeight: "800" }}>This area is not currently enabled in your preferences. You can enable it anytime.</Text><AppButton onPress={() => router.push("/fitness/preferences" as Href)} size="sm" title="Customize Fitness" variant="secondary" /></AppCard> : null}
    {message ? <AppCard variant="soft"><Text style={{ color: theme.text, fontWeight: "800" }}>{message}</Text></AppCard> : null}
    <AppCard style={[styles.hero, { borderColor: theme.border }]}><Text style={[styles.title, { color: theme.text }]}>{goal.title}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{goal.whyItHelps}</Text><View style={styles.chips}><Chip label={goal.timeline ?? "Flexible timeline"} /><Chip label={goal.difficulty ?? "Adaptable"} /><Chip label={goal.safetyLevel ?? "General guidance"} /></View><View style={styles.actions}><AppButton onPress={() => setMessage("Goal path started as a preview. No calendar events were created.")} title="Start this path" /><AppButton onPress={() => setMessage("Goal saved for this preview.")} title="Save goal" variant="secondary" /><AppButton onPress={() => router.push("/fitness/programs" as Href)} title="View matching programs" variant="secondary" /><AppButton onPress={() => setMessage("Activation is coming soon. No calendar events were created.")} title="Activate later" variant="ghost" /></View></AppCard>
    <AppSection title="Goal setup preview" />
    <View style={styles.metrics}><Metric label="Current level" value={goal.currentLevel ?? "Current routine"} /><Metric label="Target level" value={goal.targetLevel ?? goal.subtitle} /><Metric label="Weekly progression" value="Progress one controlled step at a time" /><Metric label="Training days" value={goal.trainingDays ?? "3 days per week"} /><Metric label="Recovery" value={goal.recoveryRequirement ?? "Include lighter days"} /><Metric label="Nutrition support" value={goal.nutritionSupport ?? "Balanced food planning and hydration"} /></View>
    <AppSection title="Step-by-step progression" subtitle="Progress only when the current step feels controlled and repeatable." />
    <View style={styles.stack}>{steps.map((step, index) => <AppCard key={`${step.title}-${index}`} style={[styles.step, { borderColor: theme.border }]}><Text style={[styles.stepIndex, { color: theme.primary }]}>Step {index + 1}</Text><Text style={[styles.stepTitle, { color: theme.text }]}>{step.title.replace(/^Step \d+:\s*/, "")}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{step.description}</Text></AppCard>)}</View>
    <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}><Text style={[styles.body, { color: theme.warning }]}>General guidance: adjust to your body and seek professional advice when needed. {STOP_GUIDANCE}</Text></AppCard>
    <AppSection title="Recommended programs" />
    <View style={styles.stack}>{fallbackRecommended.map((program) => <ProgramCard key={program.id} program={programFromFallback(program)} />)}</View>
    <AppButton onPress={() => router.push("/fitness/goals" as Href)} title="Back to goal paths" variant="secondary" />
  </AppMainLayout>;
}

function Metric({ label, value }: { label: string; value: string }) { const { theme } = useAppTheme(); return <AppCard style={styles.metric}><Text style={[styles.metricLabel, { color: theme.mutedText }]}>{label}</Text><Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text></AppCard>; }
function Chip({ label }: { label: string }) { const { theme } = useAppTheme(); return <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}><Text style={{ color: theme.primary, fontSize: 10, fontWeight: "900" }}>{label}</Text></View>; }
const styles = StyleSheet.create({ actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }, body: { fontSize: 12, lineHeight: 19, marginTop: 5 }, chip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 }, hero: { borderWidth: 1 }, metric: { flexBasis: "46%", flexGrow: 1 }, metricLabel: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" }, metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, metricValue: { fontSize: 14, fontWeight: "900", lineHeight: 19, marginTop: 6 }, stack: { gap: 11 }, step: { borderWidth: 1 }, stepIndex: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" }, stepTitle: { fontSize: 17, fontWeight: "900", marginTop: 3 }, title: { fontSize: 27, fontWeight: "900" } });
