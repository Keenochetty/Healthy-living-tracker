import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  MuscleFocusCard,
  muscleKeysFromText,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  clearStoredPreview,
  getStoredPreview,
  saveImportedPlanDraft,
  type NormalizedImportedPlan,
} from "@/services/fitnessAiImportService";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function AiImportPreviewScreen() {
  const { theme } = useAppTheme();
  const { activeProfile } = useActiveProfile();
  const [plan, setPlan] = useState<NormalizedImportedPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useFocusEffect(
    useCallback(() => {
      getStoredPreview().then(setPlan);
    }, []),
  );
  const scores = useMemo(() => planScores(plan), [plan]);
  async function importDraft() {
    if (!plan) return;
    setSaving(true);
    try {
      const id = await saveImportedPlanDraft(plan, {
        audience: plan.audience,
        profileId:
          activeProfile?.profileType === "self" ? activeProfile.id : undefined,
      });
      await clearStoredPreview();
      router.replace(`/fitness/imported-plan/${id}` as Href);
    } catch {
      setMessage(
        "Could not save this draft. Sign in and check your connection.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (!plan)
    return (
      <AppMainLayout title="Plan Preview">
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            No plan preview selected.
          </Text>
          <AppButton
            onPress={() => router.replace("/fitness/ai-import" as Href)}
            title="Back to search"
          />
        </AppCard>
      </AppMainLayout>
    );
  return (
    <AppMainLayout
      subtitle="Review the normalized structure, sources, and safety warnings before importing."
      title="Plan Preview"
    >
      {message ? (
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            {message}
          </Text>
        </AppCard>
      ) : null}
      <AppCard style={[styles.hero, { borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{plan.title}</Text>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          {plan.description}
        </Text>
        <Text style={[styles.meta, { color: theme.mutedText }]}>
          Source: {plan.sourceTitle ?? "Structured source"} ·{" "}
          {plan.sourceDomain ?? "No domain"}
        </Text>
        <Text style={[styles.meta, { color: theme.mutedText }]}>
          {plan.sourceUrl ?? "No external URL"} ·{" "}
          {plan.sourceLicenseNote ?? "Reuse terms unclear; review required."}
        </Text>
        <Text style={[styles.meta, { color: theme.primary }]}>
          {plan.planType.replace(/_/g, " ")} · {plan.goal} · {plan.durationDays}{" "}
          days · {plan.difficulty}
        </Text>
      </AppCard>
      {plan.safetyFlags.length ? (
        <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}>
          <Text style={[styles.sectionTitle, { color: theme.warning }]}>
            Safety warnings
          </Text>
          {plan.safetyFlags.map((flag) => (
            <Text key={flag} style={[styles.body, { color: theme.warning }]}>
              • {flag}
            </Text>
          ))}
        </AppCard>
      ) : null}
      {Object.keys(scores).length ? (
        <>
          <AppSection title="Muscle-map impact" />
          <MuscleFocusCard
            mode="exercise"
            muscleScores={scores}
            title="Plan Muscle Focus"
          />
        </>
      ) : null}
      <AppSection
        title="Normalized schedule"
        subtitle="This remains editable after import."
      />
      <View style={styles.stack}>
        {plan.days.map((day) => (
          <AppCard key={day.dayNumber}>
            <Text style={[styles.dayTitle, { color: theme.text }]}>
              Day {day.dayNumber} · {day.title}
            </Text>
            <Text style={[styles.body, { color: theme.mutedText }]}>
              {day.focus} · ~
              {day.estimatedMinutes ?? plan.estimatedMinutesPerSession ?? 30}{" "}
              min
            </Text>
            {day.exercises?.map((item) => (
              <Text
                key={item.name}
                style={[styles.body, { color: theme.mutedText }]}
              >
                • {item.name} {item.sets ?? ""} {item.reps ?? item.time ?? ""}
              </Text>
            ))}
            {day.meals?.map((item) => (
              <Text
                key={`${item.mealType}-${item.name}`}
                style={[styles.body, { color: theme.mutedText }]}
              >
                • {item.mealType}: {item.name}
              </Text>
            ))}
            {day.safetyNote ? (
              <Text style={[styles.body, { color: theme.warning }]}>
                {day.safetyNote}
              </Text>
            ) : null}
          </AppCard>
        ))}
      </View>
      <AppCard variant="soft">
        <Text style={[styles.body, { color: theme.text }]}>
          Calendar preview: importing creates a draft only. No calendar events
          are created until you edit and activate it later.
        </Text>
      </AppCard>
      <View style={styles.actions}>
        <AppButton
          loading={saving}
          onPress={importDraft}
          title="Import as Draft"
        />
        <AppButton
          onPress={async () => {
            await clearStoredPreview();
            router.replace("/fitness/ai-import" as Href);
          }}
          title="Reject"
          variant="danger"
        />
      </View>
    </AppMainLayout>
  );
}
function planScores(plan: NormalizedImportedPlan | null): MuscleScoreMap {
  const scores: MuscleScoreMap = {};
  plan?.days.forEach((day) =>
    day.exercises?.forEach((exercise) =>
      muscleKeysFromText(exercise.muscleGroups).forEach((key) => {
        scores[key] = Math.max(scores[key] ?? 0, 0.7);
      }),
    ),
  );
  return scores;
}
const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  dayTitle: { fontSize: 16, fontWeight: "900" },
  hero: { borderWidth: 1 },
  meta: { fontSize: 10, fontWeight: "800", marginTop: 7 },
  sectionTitle: { fontSize: 15, fontWeight: "900" },
  stack: { gap: 10 },
  title: { fontSize: 25, fontWeight: "900" },
});
