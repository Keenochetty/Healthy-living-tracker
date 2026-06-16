import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import {
  activateImportedPlan,
  deleteImportedPlan,
  getImportedPlanById,
  removeImportedPlanDay,
  updateImportedPlan,
} from "@/services/fitnessAiImportService";
import { useAppTheme } from "@/theme/ThemeProvider";

type DraftPlan = {
  audience?: string;
  difficulty?: string;
  equipment?: string[];
  goal?: string;
  id: string;
  intensity?: string;
  notes?: string;
  review_required?: boolean;
  safety_flags?: string[];
  source_domain?: string;
  source_url?: string;
  status: string;
  title: string;
  workout_time?: string;
};
type DraftDay = {
  estimated_minutes: number;
  exercises?: string[];
  focus: string;
  id: string;
  meals?: Array<{ name: string }>;
  safety_note?: string;
  source_day_number: number;
  title?: string;
};

export default function ImportedPlanDetailScreen() {
  const { theme } = useAppTheme();
  const { importedPlanId = "" } = useLocalSearchParams<{
    importedPlanId?: string;
  }>();
  const [plan, setPlan] = useState<DraftPlan | null>(null);
  const [days, setDays] = useState<DraftDay[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState("07:00");
  const [equipment, setEquipment] = useState("");
  const [intensity, setIntensity] = useState("Beginner");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const result = await getImportedPlanById(String(importedPlanId));
    setPlan(result.plan as DraftPlan);
    setDays(result.days as DraftDay[]);
    if (result.plan) {
      setTitle(result.plan.title);
      setNotes(result.plan.notes ?? "");
      setTime(result.plan.workout_time ?? "07:00");
      setEquipment((result.plan.equipment ?? []).join(", "));
      setIntensity(
        result.plan.intensity ?? result.plan.difficulty ?? "Beginner",
      );
    }
  }, [importedPlanId]);

  useEffect(() => {
    load().catch(() => setMessage("Could not load this imported draft."));
  }, [load]);
  async function save() {
    setSaving(true);
    const result = await updateImportedPlan(String(importedPlanId), {
      equipment: equipment
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      intensity,
      notes,
      title,
      workout_time: time,
    });
    setSaving(false);
    setMessage(
      result.error ? "Could not save changes." : "Draft changes saved.",
    );
    await load();
  }
  async function activate() {
    setSaving(true);
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const result = await activateImportedPlan(String(importedPlanId), {
      profileId: undefined,
      reminderMinutes: 30,
      restDayHandling: "skip",
      startDate: start.toISOString().slice(0, 10),
      workoutTime: time,
      workoutWeekdays: [1, 3, 5],
    });
    setSaving(false);
    setMessage(
      result.error
        ? "Could not activate this draft. Review warnings and try again."
        : `${result.data?.calendarEventCount ?? 0} real calendar events created.`,
    );
    await load();
  }
  async function removeDay(id: string) {
    await removeImportedPlanDay(id);
    await load();
  }
  async function removePlan() {
    const result = await deleteImportedPlan(String(importedPlanId));
    if (result.error) setMessage("Only draft plans can be deleted.");
    else router.replace("/fitness/imported-plans" as Href);
  }
  if (!plan)
    return (
      <AppMainLayout title="Imported Draft">
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            {message || "Loading draft..."}
          </Text>
        </AppCard>
      </AppMainLayout>
    );
  return (
    <AppMainLayout
      subtitle="Edit every detail before activating this plan on your calendar."
      title="Imported Draft"
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
        <Text style={[styles.meta, { color: theme.mutedText }]}>
          Status: {plan.status} · Source:{" "}
          {plan.source_domain ?? "structured source"}
        </Text>
        {plan.review_required ? (
          <Text style={[styles.warning, { color: theme.warning }]}>
            Review required. This is general guidance, not medical advice.
          </Text>
        ) : null}
        <View style={styles.chips}>
          <AppChip label={plan.audience ?? "Adults"} />
          <AppChip label={plan.goal ?? "General goal"} />
          <AppChip label={intensity} />
        </View>
      </AppCard>
      <AppSection title="Edit draft" />
      <AppCard style={styles.form}>
        <Field label="Plan name" onChangeText={setTitle} value={title} />
        <Field label="Preferred time" onChangeText={setTime} value={time} />
        <Field
          label="Equipment, comma separated"
          onChangeText={setEquipment}
          value={equipment}
        />
        <Field
          label="Intensity"
          onChangeText={setIntensity}
          value={intensity}
        />
        <Field
          label="Notes and safety guidance"
          multiline
          onChangeText={setNotes}
          value={notes}
        />
        <AppButton loading={saving} onPress={save} title="Save draft changes" />
      </AppCard>
      <AppSection
        title="Plan days"
        subtitle="Remove any day, exercise group, or meal group you do not want."
      />
      <View style={styles.stack}>
        {days.map((day) => (
          <AppCard
            key={day.id}
            style={[styles.day, { borderColor: theme.border }]}
          >
            <Text style={[styles.dayTitle, { color: theme.text }]}>
              Day {day.source_day_number} · {day.title ?? day.focus}
            </Text>
            <Text style={[styles.body, { color: theme.mutedText }]}>
              {day.focus} · ~{day.estimated_minutes} min
            </Text>
            {day.exercises?.length ? (
              <Text style={[styles.body, { color: theme.mutedText }]}>
                Exercises: {day.exercises.join(", ")}
              </Text>
            ) : null}
            {day.meals?.length ? (
              <Text style={[styles.body, { color: theme.mutedText }]}>
                Meals: {day.meals.map((meal) => meal.name).join(", ")}
              </Text>
            ) : null}
            {day.safety_note ? (
              <Text style={[styles.warning, { color: theme.warning }]}>
                {day.safety_note}
              </Text>
            ) : null}
            {plan.status === "draft" ? (
              <AppButton
                onPress={() => removeDay(day.id)}
                size="sm"
                title="Remove day"
                variant="danger"
              />
            ) : null}
          </AppCard>
        ))}
      </View>
      <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}>
        <Text style={[styles.warning, { color: theme.warning }]}>
          Activating creates individual real calendar events. Review all
          exercises, meals, ingredients, timing, and safety flags first.
        </Text>
      </AppCard>
      <View style={styles.actions}>
        {plan.status === "draft" ? (
          <>
            <AppButton
              disabled={!days.length || saving}
              loading={saving}
              onPress={activate}
              title="Activate on calendar"
            />
            <AppButton
              onPress={removePlan}
              title="Delete draft"
              variant="danger"
            />
          </>
        ) : (
          <AppButton
            onPress={() => router.push("/calendar" as Href)}
            title="View calendar"
          />
        )}
        <AppButton
          onPress={() => router.push("/fitness/imported-plans" as Href)}
          title="Back to drafts"
          variant="secondary"
        />
      </View>
    </AppMainLayout>
  );
}
function Field({
  label,
  multiline,
  onChangeText,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholderTextColor={theme.mutedText}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            backgroundColor: theme.surfaceSoft ?? theme.background,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={value}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  day: { borderWidth: 1, gap: 7 },
  dayTitle: { fontSize: 16, fontWeight: "900" },
  field: { gap: 6 },
  form: { gap: 13 },
  hero: { borderWidth: 1 },
  input: {
    borderRadius: 15,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  label: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  meta: { fontSize: 10, fontWeight: "800", marginTop: 6 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  stack: { gap: 10 },
  title: { fontSize: 24, fontWeight: "900" },
  warning: { fontSize: 11, fontWeight: "800", lineHeight: 17, marginTop: 7 },
});
