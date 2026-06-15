import { Href, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { FitnessSummary, WorkoutSession } from "@/types/fitness";

const BLUE = "#2563eb";
const BLUE_SOFT = "#dbeafe";

type DashboardTab =
  | "body"
  | "library"
  | "progress"
  | "routines"
  | "running"
  | "start";

export function FitnessDashboardSections({
  latestWorkout,
  onTab,
  summary,
}: {
  latestWorkout?: WorkoutSession;
  onTab: (tab: DashboardTab) => void;
  summary: FitnessSummary | null;
}) {
  return (
    <>
      <QuickGoals onTab={onTab} />
      <TodayWorkout onTab={onTab} summary={summary} />
      <ExerciseGuides onTab={onTab} />
      <PersonalBests
        latestWorkout={latestWorkout}
        onTab={onTab}
        summary={summary}
      />
      <WeightProgress />
    </>
  );
}

function QuickGoals({ onTab }: { onTab: (tab: DashboardTab) => void }) {
  const { theme } = useAppTheme();
  const goals: Array<{
    icon: AppIconName;
    label: string;
    tab: DashboardTab;
    value: string;
  }> = [
    {
      icon: "fitness",
      label: "Strength",
      tab: "routines",
      value: "2 sessions",
    },
    { icon: "health", label: "Cardio", tab: "running", value: "45 min" },
    {
      icon: "weight",
      label: "Body metrics",
      tab: "progress",
      value: "On track",
    },
  ];
  return (
    <AppSection
      subtitle="Your main focus areas for this week."
      title="Quick goals"
    >
      <View style={styles.goalRow}>
        {goals.map((goal) => (
          <Pressable
            accessibilityRole="button"
            key={goal.label}
            onPress={() => onTab(goal.tab)}
            style={({ pressed }) => [
              styles.goalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.goalIcon}>
              <AppIcon color={BLUE} decorative name={goal.icon} size={19} />
            </View>
            <Text style={[styles.goalLabel, { color: theme.mutedText }]}>
              {goal.label}
            </Text>
            <Text style={[styles.goalValue, { color: theme.text }]}>
              {goal.value}
            </Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function TodayWorkout({
  onTab,
  summary,
}: {
  onTab: (tab: DashboardTab) => void;
  summary: FitnessSummary | null;
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      subtitle="A structured session ready when you are."
      title="Today's workout"
    >
      <AppCard style={[styles.workoutCard, { borderColor: theme.border }]}>
        <View style={styles.workoutTop}>
          <View style={styles.workoutIcon}>
            <AppIcon color="#ffffff" decorative name="fitness" size={22} />
          </View>
          <View style={styles.workoutCopy}>
            <Text style={[styles.workoutTitle, { color: theme.text }]}>
              Full-body starter
            </Text>
            <Text style={[styles.workoutMeta, { color: theme.mutedText }]}>
              25 min | Bodyweight | Beginner friendly
            </Text>
          </View>
          <View style={styles.readyPill}>
            <Text style={styles.readyText}>
              {summary?.activeMinutesToday ? "Continue" : "Ready"}
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.chipRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {["Pull-ups", "Sit-ups", "Squats", "Mobility"].map((label) => (
            <View key={label} style={styles.exerciseChip}>
              <Text style={styles.exerciseChipText}>{label}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.workoutActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onTab("start")}
            style={styles.primaryButton}
          >
            <AppIcon color="#ffffff" decorative name="fitness" size={17} />
            <Text style={styles.primaryButtonText}>Start workout</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onTab("start")}
            style={[styles.secondaryButton, { borderColor: theme.border }]}
          >
            <AppIcon color={BLUE} decorative name="edit" size={17} />
            <Text style={styles.secondaryButtonText}>Quick log</Text>
          </Pressable>
        </View>
      </AppCard>
    </AppSection>
  );
}

function ExerciseGuides({ onTab }: { onTab: (tab: DashboardTab) => void }) {
  const { theme } = useAppTheme();
  const guides = [
    {
      detail: "Form and progression",
      icon: "fitness" as AppIconName,
      label: "Pull-ups",
      tab: "library" as DashboardTab,
    },
    {
      detail: "Core technique",
      icon: "health" as AppIconName,
      label: "Sit-ups",
      tab: "library" as DashboardTab,
    },
    {
      detail: "Pace and distance",
      icon: "fitness" as AppIconName,
      label: "Running",
      tab: "running" as DashboardTab,
    },
    {
      detail: "Structured routines",
      icon: "weight" as AppIconName,
      label: "Gym workouts",
      tab: "routines" as DashboardTab,
    },
  ];
  return (
    <AppSection
      subtitle="Structured cards for form, pacing, and progression."
      title="Exercise guides"
    >
      <View style={styles.guideGrid}>
        {guides.map((guide) => (
          <Pressable
            accessibilityRole="button"
            key={guide.label}
            onPress={() => onTab(guide.tab)}
            style={({ pressed }) => [
              styles.guideCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.guideMedia}>
              <AppIcon color={BLUE} decorative name={guide.icon} size={24} />
              <Text style={styles.guideMediaText}>Guide</Text>
            </View>
            <Text style={[styles.guideTitle, { color: theme.text }]}>
              {guide.label}
            </Text>
            <Text style={[styles.guideDetail, { color: theme.mutedText }]}>
              {guide.detail}
            </Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function PersonalBests({
  latestWorkout,
  onTab,
  summary,
}: {
  latestWorkout?: WorkoutSession;
  onTab: (tab: DashboardTab) => void;
  summary: FitnessSummary | null;
}) {
  const { theme } = useAppTheme();
  const bests = [
    {
      icon: "fitness" as AppIconName,
      label: "Longest run",
      value: latestWorkout?.distanceKm
        ? `${latestWorkout.distanceKm.toFixed(1)} km`
        : "Log your first run",
    },
    {
      icon: "success" as AppIconName,
      label: "Workout streak",
      value: `${summary?.currentStreakDays ?? 0} days`,
    },
    {
      icon: "today" as AppIconName,
      label: "Active minutes",
      value: `${summary?.activeMinutesToday ?? 0} min today`,
    },
  ];
  return (
    <AppSection
      actionLabel="All progress"
      onActionPress={() => onTab("progress")}
      subtitle="Simple milestones from your saved activity."
      title="Personal bests"
    >
      <View style={styles.pbStack}>
        {bests.map((best) => (
          <Pressable
            accessibilityRole="button"
            key={best.label}
            onPress={() => onTab("progress")}
            style={({ pressed }) => [
              styles.pbCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.pbIcon}>
              <AppIcon color={BLUE} decorative name={best.icon} size={19} />
            </View>
            <View style={styles.pbCopy}>
              <Text style={[styles.pbLabel, { color: theme.mutedText }]}>
                {best.label}
              </Text>
              <Text style={[styles.pbValue, { color: theme.text }]}>
                {best.value}
              </Text>
            </View>
            <Text style={styles.pbArrow}>{">"}</Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function WeightProgress() {
  const { theme } = useAppTheme();
  const bars = [54, 61, 58, 67, 64, 72];
  return (
    <AppSection
      subtitle="Clear units and time range for body progress."
      title="Weight progress"
    >
      <Pressable
        accessibilityLabel="Weight progress, 72.2 kilograms latest, last 30 days"
        accessibilityRole="button"
        onPress={() => router.push("/health/general/weight" as Href)}
      >
        <AppCard style={[styles.weightCard, { borderColor: theme.border }]}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={[styles.weightLabel, { color: theme.mutedText }]}>
                Latest weight
              </Text>
              <Text style={[styles.weightValue, { color: theme.text }]}>
                72.2 kg
              </Text>
            </View>
            <View style={styles.rangePill}>
              <Text style={styles.rangeText}>Last 30 days</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {bars.map((bar, index) => (
              <View
                key={index}
                style={[styles.chartBar, { height: `${bar}%` }]}
              />
            ))}
          </View>
          <Text style={[styles.chartCaption, { color: theme.mutedText }]}>
            Weight shown in kilograms (kg)
          </Text>
        </AppCard>
      </Pressable>
    </AppSection>
  );
}

const styles = StyleSheet.create({
  chart: {
    alignItems: "flex-end",
    backgroundColor: "#eff6ff",
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    height: 96,
    marginTop: 16,
    overflow: "hidden",
    padding: 12,
  },
  chartBar: {
    backgroundColor: "#60a5fa",
    borderRadius: 999,
    flex: 1,
    minHeight: 18,
  },
  chartCaption: { fontSize: 10, marginTop: 8, textAlign: "right" },
  chipRow: { gap: 7, paddingRight: 12 },
  exerciseChip: {
    backgroundColor: BLUE_SOFT,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  exerciseChipText: { color: "#1e3a8a", fontSize: 11, fontWeight: "900" },
  goalCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 118,
    padding: 10,
  },
  goalIcon: {
    alignItems: "center",
    backgroundColor: BLUE_SOFT,
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 9,
    textAlign: "center",
  },
  goalRow: { flexDirection: "row", gap: 8 },
  goalValue: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  guideCard: {
    borderRadius: 21,
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    minHeight: 150,
    padding: 11,
  },
  guideDetail: { fontSize: 10, lineHeight: 15, marginTop: 4 },
  guideGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  guideMedia: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    flexDirection: "row",
    gap: 7,
    height: 66,
    justifyContent: "center",
  },
  guideMediaText: {
    color: "#1d4ed8",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  guideTitle: { fontSize: 14, fontWeight: "900", marginTop: 10 },
  pbArrow: { color: BLUE, fontSize: 18, fontWeight: "900" },
  pbCard: {
    alignItems: "center",
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 74,
    padding: 13,
  },
  pbCopy: { flex: 1 },
  pbIcon: {
    alignItems: "center",
    backgroundColor: BLUE_SOFT,
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  pbLabel: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  pbStack: { gap: 9 },
  pbValue: { fontSize: 14, fontWeight: "900", marginTop: 3 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  primaryButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    minHeight: 46,
    paddingHorizontal: 17,
  },
  primaryButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  rangePill: {
    backgroundColor: BLUE_SOFT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rangeText: { color: "#1d4ed8", fontSize: 10, fontWeight: "900" },
  readyPill: {
    backgroundColor: BLUE_SOFT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  readyText: { color: "#1d4ed8", fontSize: 10, fontWeight: "900" },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 46,
    paddingHorizontal: 15,
  },
  secondaryButtonText: { color: "#1d4ed8", fontSize: 12, fontWeight: "900" },
  weightCard: { borderWidth: 1, padding: 16 },
  weightHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weightLabel: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  weightValue: { fontSize: 20, fontWeight: "900", marginTop: 4 },
  workoutActions: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  workoutCard: { borderWidth: 1, gap: 16, padding: 16 },
  workoutCopy: { flex: 1 },
  workoutIcon: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  workoutMeta: { fontSize: 11, lineHeight: 17, marginTop: 4 },
  workoutTitle: { fontSize: 17, fontWeight: "900" },
  workoutTop: { alignItems: "center", flexDirection: "row", gap: 11 },
});
