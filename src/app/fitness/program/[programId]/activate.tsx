import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import { FITNESS_WORKOUT_PROGRAMS } from "@/constants/fitnessRealmConfig";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  activateProgramPlan,
  buildPlanSchedulePreview,
  deactivateFitnessPlan,
  getActiveFitnessPlans,
  type ActiveFitnessPlan,
  type PlanSchedulePreviewDay,
} from "@/services/fitnessPlanActivationService";
import { useAppTheme } from "@/theme/ThemeProvider";

const WEEKDAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function ActivatePlanScreen() {
  const { theme } = useAppTheme();
  const { activeProfile, permittedProfiles } = useActiveProfile();
  const { programId = "" } = useLocalSearchParams<{ programId?: string }>();
  const program =
    FITNESS_WORKOUT_PROGRAMS.find((item) => item.id === String(programId)) ??
    FITNESS_WORKOUT_PROGRAMS[0];
  const eligibleProfiles = useMemo(
    () => permittedProfiles.filter((profile) => profile.profileType === "self"),
    [permittedProfiles],
  );
  const [startDate, setStartDate] = useState(tomorrowKey());
  const [workoutTime, setWorkoutTime] = useState("07:00");
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [workoutWeekdays, setWorkoutWeekdays] = useState<number[]>(
    defaultWeekdays(program.id),
  );
  const [restDayHandling, setRestDayHandling] = useState<"skip" | "show">(
    "skip",
  );
  const [calendarColor, setCalendarColor] = useState("#6ee7c8");
  const [profileId, setProfileId] = useState(
    activeProfile?.profileType === "self" ? activeProfile.id : "",
  );
  const [preview, setPreview] = useState<PlanSchedulePreviewDay[]>([]);
  const [activePlans, setActivePlans] = useState<ActiveFitnessPlan[]>([]);
  const [duplicateId, setDuplicateId] = useState("");
  const [pendingDeactivateId, setPendingDeactivateId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const options = useMemo(
    () => ({
      calendarColor,
      profileId: profileId || undefined,
      reminderMinutes,
      restDayHandling,
      startDate,
      workoutTime,
      workoutWeekdays,
    }),
    [
      calendarColor,
      profileId,
      reminderMinutes,
      restDayHandling,
      startDate,
      workoutTime,
      workoutWeekdays,
    ],
  );

  useEffect(() => {
    buildPlanSchedulePreview(String(programId), options)
      .then(setPreview)
      .catch(() => setPreview([]));
  }, [options, programId]);
  useEffect(() => {
    getActiveFitnessPlans()
      .then(({ data }) => setActivePlans((data ?? []) as ActiveFitnessPlan[]))
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (activeProfile?.profileType === "self") setProfileId(activeProfile.id);
    else if (eligibleProfiles[0]?.id) setProfileId(eligibleProfiles[0].id);
  }, [activeProfile?.id, activeProfile?.profileType, eligibleProfiles]);

  async function activate(duplicateAnyway = false) {
    setSaving(true);
    setMessage("");
    const result = await activateProgramPlan(String(programId), {
      ...options,
      duplicateAnyway,
    });
    setSaving(false);
    if (result.duplicate) {
      setDuplicateId(result.duplicate.id);
      setMessage(
        "This plan is already active. View it, duplicate anyway, or cancel.",
      );
      return;
    }
    if (result.error) {
      setMessage(
        "Could not activate this plan. Check your connection and calendar permissions.",
      );
      return;
    }
    setMessage(
      `${result.data?.calendarEventCount ?? 0} workout events added to your calendar.`,
    );
    const plans = await getActiveFitnessPlans();
    setActivePlans((plans.data ?? []) as ActiveFitnessPlan[]);
  }

  async function deactivate(planId: string) {
    setSaving(true);
    const result = await deactivateFitnessPlan(planId, {
      removeFutureEvents: true,
    });
    setSaving(false);
    setMessage(
      result.error
        ? "Could not deactivate this plan."
        : "Plan deactivated. Future generated events were removed.",
    );
    const plans = await getActiveFitnessPlans();
    setActivePlans((plans.data ?? []) as ActiveFitnessPlan[]);
  }

  return (
    <AppMainLayout
      subtitle="Choose when and how this plan should appear on your calendar."
      title="Activate Plan"
    >
      {message ? (
        <AppCard variant="soft">
          <Text
            style={{ color: theme.text, fontWeight: "800", lineHeight: 20 }}
          >
            {message}
          </Text>
          {duplicateId ? (
            <View style={styles.actions}>
              <AppButton
                onPress={() => router.push("/calendar" as Href)}
                size="sm"
                title="View active plan"
              />
              <AppButton
                onPress={() => activate(true)}
                size="sm"
                title="Duplicate anyway"
                variant="secondary"
              />
              <AppButton
                onPress={() => {
                  setDuplicateId("");
                  setMessage("");
                }}
                size="sm"
                title="Cancel"
                variant="ghost"
              />
            </View>
          ) : null}
        </AppCard>
      ) : null}
      {pendingDeactivateId ? (
        <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>
            Deactivate this plan?
          </Text>
          <Text style={[styles.body, { color: theme.mutedText }]}>
            Future generated calendar events will be deleted. Past calendar
            entries and fitness history will be kept.
          </Text>
          <View style={styles.actions}>
            <AppButton
              disabled={saving}
              onPress={() => {
                const id = pendingDeactivateId;
                setPendingDeactivateId("");
                deactivate(id);
              }}
              size="sm"
              title="Confirm deactivation"
              variant="danger"
            />
            <AppButton
              onPress={() => setPendingDeactivateId("")}
              size="sm"
              title="Keep plan"
              variant="secondary"
            />
          </View>
        </AppCard>
      ) : null}
      <AppCard style={[styles.card, { borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {program.title}
        </Text>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          {program.subtitle}
        </Text>
        <View style={styles.chips}>
          <Chip label={program.duration} />
          <Chip label={`${program.days ?? 7} days`} />
          <Chip label={program.level ?? "Beginner"} />
          <Chip label={program.goal ?? "General fitness"} />
          <Chip label={program.audience ?? "Adults"} />
        </View>
        {program.safetyBadge ? (
          <Text style={[styles.safety, { color: theme.warning }]}>
            General guidance · adjust to your body · seek professional advice
            when needed.
          </Text>
        ) : null}
      </AppCard>
      <AppSection
        title="Schedule setup"
        subtitle="Dates use YYYY-MM-DD and times use HH:MM."
      />
      <AppCard style={styles.form}>
        <Field
          label="Start date"
          onChangeText={setStartDate}
          value={startDate}
        />
        <Field
          label="Preferred workout time"
          onChangeText={setWorkoutTime}
          value={workoutTime}
        />
        <Text style={[styles.label, { color: theme.text }]}>Reminder</Text>
        <View style={styles.chips}>
          {[0, 15, 30, 60].map((minutes) => (
            <AppChip
              key={minutes}
              label={minutes ? `${minutes} min before` : "None"}
              onPress={() => setReminderMinutes(minutes)}
              selected={reminderMinutes === minutes}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Workout days</Text>
        <View style={styles.chips}>
          {WEEKDAYS.map((day) => (
            <AppChip
              key={day.value}
              label={day.label}
              onPress={() =>
                setWorkoutWeekdays(toggleDay(workoutWeekdays, day.value))
              }
              selected={workoutWeekdays.includes(day.value)}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Rest days</Text>
        <View style={styles.chips}>
          <AppChip
            label="Skip rest days"
            onPress={() => setRestDayHandling("skip")}
            selected={restDayHandling === "skip"}
          />
          <AppChip
            label="Show recovery"
            onPress={() => setRestDayHandling("show")}
            selected={restDayHandling === "show"}
          />
        </View>
        <Text style={[styles.label, { color: theme.text }]}>
          Calendar colour
        </Text>
        <View style={styles.chips}>
          {["#6ee7c8", "#38bdf8", "#a78bfa", "#f8b84e"].map((color) => (
            <Pressable
              key={color}
              onPress={() => setCalendarColor(color)}
              style={[
                styles.color,
                {
                  backgroundColor: color,
                  borderColor: calendarColor === color ? theme.text : color,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.text }]}>
          Profile / member
        </Text>
        <View style={styles.chips}>
          {eligibleProfiles.map((profile) => (
            <AppChip
              key={profile.id}
              label={profile.displayName}
              onPress={() => setProfileId(profile.id)}
              selected={profileId === profile.id}
            />
          ))}
        </View>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          Calendar activation currently supports your authenticated self
          profile.
        </Text>
      </AppCard>
      <AppSection
        title="Preview schedule"
        subtitle={`${preview.length} individual workout events will be created.`}
      />
      <View style={styles.stack}>
        {preview.slice(0, 12).map((day) => (
          <AppCard
            key={day.scheduledFor}
            style={[styles.preview, { borderColor: theme.border }]}
          >
            <Text style={[styles.previewDate, { color: theme.primary }]}>
              {new Date(day.scheduledFor).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
            <Text style={[styles.previewTitle, { color: theme.text }]}>
              Day {day.dayNumber} · {day.focus}
            </Text>
            <Text style={[styles.body, { color: theme.mutedText }]}>
              {day.durationMinutes} min ·{" "}
              {day.exercises.slice(0, 4).join(", ") || "See plan details"}
            </Text>
            {day.safetyNote ? (
              <Text style={[styles.safety, { color: theme.warning }]}>
                {day.safetyNote}
              </Text>
            ) : null}
          </AppCard>
        ))}
      </View>
      {preview.length > 12 ? (
        <Text style={[styles.body, { color: theme.mutedText }]}>
          Plus {preview.length - 12} more scheduled workouts.
        </Text>
      ) : null}
      <AppButton
        disabled={!preview.length || saving}
        loading={saving}
        onPress={() => activate(false)}
        title="Confirm activation"
      />
      {activePlans.length ? (
        <>
          <AppSection
            title="Active plans"
            subtitle="Deactivate a plan and remove its future generated events."
          />
          <View style={styles.stack}>
            {activePlans.map((plan) => (
              <AppCard key={plan.id}>
                <Text style={[styles.previewTitle, { color: theme.text }]}>
                  {plan.title}
                </Text>
                <Text style={[styles.body, { color: theme.mutedText }]}>
                  Started {plan.start_date}
                </Text>
                <View style={styles.actions}>
                  <AppButton
                    onPress={() => router.push("/calendar" as Href)}
                    size="sm"
                    title="View calendar"
                    variant="secondary"
                  />
                  <AppButton
                    disabled={saving}
                    onPress={() => setPendingDeactivateId(plan.id)}
                    size="sm"
                    title="Deactivate + remove future events"
                    variant="danger"
                  />
                </View>
              </AppCard>
            ))}
          </View>
        </>
      ) : null}
    </AppMainLayout>
  );
}

function Field({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholderTextColor={theme.mutedText}
        style={[
          styles.input,
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
function Chip({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
      <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
  );
}
function tomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function defaultWeekdays(programId: string) {
  return ["pregnancy", "recovery"].includes(programId) ? [1, 3, 5] : [1, 3, 5];
}
function toggleDay(current: number[], day: number) {
  return current.includes(day)
    ? current.filter((item) => item !== day)
    : [...current, day];
}
const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  card: { borderWidth: 1 },
  chip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  color: { borderRadius: 999, borderWidth: 3, height: 34, width: 34 },
  field: { gap: 6 },
  form: { gap: 15 },
  input: {
    borderRadius: 15,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: 13,
  },
  label: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  preview: { borderWidth: 1 },
  previewDate: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  previewTitle: { fontSize: 16, fontWeight: "900", marginTop: 4 },
  safety: { fontSize: 10, fontWeight: "900", lineHeight: 16, marginTop: 8 },
  stack: { gap: 10 },
  title: { fontSize: 24, fontWeight: "900" },
});
