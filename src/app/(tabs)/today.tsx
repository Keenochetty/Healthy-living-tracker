import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { TodayRealmShortcuts } from "@/components/today/TodayRealmShortcuts";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import type { FeaturePreferenceKey } from "@/constants/featurePreferenceConfig";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import { formatReminderTime } from "@/lib/reminderStorage";
import { getFitnessCalendarReminders } from "@/services/fitnessPlanActivationService";
import { getRemindersForDate } from "@/services/reminders/reminderEngine";
import {
  getUserFeaturePreferences,
  shouldShowFeature,
  type UserFeaturePreference,
} from "@/services/userFeaturePreferencesService";
import { useAppTheme } from "@/theme/ThemeProvider";
import {
  healthRealmAccents,
  realmAccentWithOpacity,
} from "@/theme/designSystem";
import type { FitnessSummary } from "@/types/fitness";
import type { HealthReminder } from "@/types/healthTimeline";
import type { DailyNutritionSummary } from "@/types/nutrition";
import type { AppReminder } from "@/types/reminders";

const TODAY_DEFAULTS: FeaturePreferenceKey[] = [
  "fitness",
  "nutrition",
  "daily_planning",
  "recovery",
  "mental_wellness",
  "workout_guide",
];

type TimelineItem = {
  dueAt: string;
  icon: AppIconName;
  id: string;
  route: Href;
  title: string;
  type: string;
};

type DashboardAction = {
  feature?: FeaturePreferenceKey;
  icon: AppIconName;
  label: string;
  route: Href;
};

export default function TodayScreen() {
  const { activeProfile } = useActiveProfile();
  const { theme } = useAppTheme();
  const [preferences, setPreferences] = useState<UserFeaturePreference[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [fitness, setFitness] = useState<FitnessSummary | null>(null);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      nextPreferences,
      healthReminders,
      fitnessEvents,
      fitnessSummary,
      nutritionSummary,
    ] = await Promise.all([
      getUserFeaturePreferences(activeProfile?.id),
      getRemindersForDate(new Date()).catch(() => []),
      getFitnessCalendarReminders().catch(() => []),
      getTodayFitnessSummary().catch(() => null),
      getTodayNutritionSummary().catch(() => null),
    ]);
    setPreferences(nextPreferences);
    setTimeline(buildTimeline(healthReminders, fitnessEvents));
    setFitness(fitnessSummary);
    setNutrition(nutritionSummary);
    setLoading(false);
  }, [activeProfile?.id]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setLoading(false));
    }, [load]),
  );

  const show = useCallback(
    (featureKey: FeaturePreferenceKey) =>
      preferences.length
        ? shouldShowFeature(featureKey, {
            preferences,
            profileType: activeProfile?.profileType,
          })
        : TODAY_DEFAULTS.includes(featureKey) ||
          (featureKey === "child_care" &&
            activeProfile?.profileType === "child") ||
          (featureKey === "teen_fitness" &&
            activeProfile?.profileType === "teen"),
    [activeProfile?.profileType, preferences],
  );

  const focusItems = useMemo(() => {
    const items: string[] = [];
    const next = timeline[0];
    if (next) items.push(`${next.title} at ${formatReminderTime(next.dueAt)}`);
    if (show("fitness") && !fitness?.activeMinutesToday)
      items.push("Move for 20 minutes");
    if (show("nutrition") && !nutrition?.foodLogCount)
      items.push("Log your next meal");
    if (show("recovery")) items.push("Make room for a short recovery stretch");
    if (show("pregnancy")) items.push("Choose gentle pregnancy-safe movement");
    if (show("child_care")) items.push("Review today's child care reminders");
    return items.slice(0, 3);
  }, [fitness?.activeMinutesToday, nutrition?.foodLogCount, show, timeline]);

  const actions = useMemo(
    () =>
      (
        [
          {
            feature: "nutrition",
            icon: "food",
            label: "Log food",
            route: "/food",
          },
          {
            feature: "fitness",
            icon: "fitness",
            label: "Start workout",
            route: "/fitness",
          },
          {
            feature: "daily_planning",
            icon: "calendar",
            label: "Add event",
            route: "/calendar",
          },
          { icon: "medication", label: "Medication", route: "/medication" },
          {
            feature: "daily_planning",
            icon: "note",
            label: "Add note",
            route: "/health/general/notes",
          },
          {
            feature: "family_circle",
            icon: "caregiver",
            label: "Family update",
            route: "/circle",
          },
          { icon: "ai", label: "Ask AI", route: "/ai" },
        ] as DashboardAction[]
      ).filter((action) => !action.feature || show(action.feature)),
    [show],
  );

  const snapshots = useMemo(
    () =>
      [
        show("fitness")
          ? {
              helper: `${fitness?.activeMinutesToday ?? 0} active minutes`,
              icon: "fitness" as AppIconName,
              route: "/fitness" as Href,
              title: "Fitness",
              value: fitness?.stepsToday
                ? `${fitness.stepsToday} steps`
                : "Ready when you are",
            }
          : null,
        show("nutrition")
          ? {
              helper: `${nutrition?.waterMl ?? 0} ml water logged`,
              icon: "food" as AppIconName,
              route: "/food" as Href,
              title: "Nutrition",
              value: nutrition?.foodLogCount
                ? `${nutrition.foodLogCount} meals logged`
                : "Plan your next meal",
            }
          : null,
        show("recovery")
          ? {
              helper: "General guidance. Adjust to your body.",
              icon: "health" as AppIconName,
              route: "/fitness" as Href,
              title: "Recovery",
              value: "Keep today sustainable",
            }
          : null,
        show("mental_wellness")
          ? {
              helper: "A brief pause can help reset your day.",
              icon: "mood" as AppIconName,
              route: "/health/general/notes" as Href,
              title: "Mental wellness",
              value: "Check in with yourself",
            }
          : null,
        show("family_circle")
          ? {
              helper: "Shared updates stay within your circle.",
              icon: "caregiver" as AppIconName,
              route: "/circle" as Href,
              title: "Family Circle",
              value: "Review family updates",
            }
          : null,
        show("pregnancy")
          ? {
              helper: "General guidance. Seek professional advice when needed.",
              icon: "pregnancy" as AppIconName,
              route: "/pregnancy" as Href,
              title: "Pregnancy",
              value: "Choose gentle movement",
            }
          : null,
        show("child_care")
          ? {
              helper: "Age-aware care and planning.",
              icon: "child_baby" as AppIconName,
              route: "/baby-child" as Href,
              title: "Child care",
              value: "Review today's care",
            }
          : null,
      ].filter(Boolean) as Array<{
        helper: string;
        icon: AppIconName;
        route: Href;
        title: string;
        value: string;
      }>,
    [fitness, nutrition, show],
  );

  const empty =
    !loading &&
    !preferences.length &&
    !timeline.length &&
    !fitness?.activeMinutesToday &&
    !nutrition?.foodLogCount;

  return (
    <AppMainLayout
      subtitle={formatTodayDate()}
      title={`Good ${dayPart()}${activeProfile?.displayName ? `, ${activeProfile.displayName}` : ""}`}
    >
      <Pressable
        onPress={() => router.push("/fitness/preferences" as Href)}
        style={styles.customize}
      >
        <AppIcon color={theme.primary} decorative name="settings" size={16} />
        <Text style={[styles.customizeText, { color: theme.primary }]}>
          Customize
        </Text>
      </Pressable>

      <AppCard style={[styles.hero, { borderColor: theme.border }]}>
        <View
          pointerEvents="none"
          style={[styles.heroOrb, { backgroundColor: theme.primary }]}
        />
        <View style={styles.heroTopRow}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>
            Today's focus
          </Text>
          <View
            style={[styles.datePill, { backgroundColor: theme.primarySoft }]}
          >
            <Text style={[styles.datePillText, { color: theme.primary }]}>
              {formatShortDate()}
            </Text>
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: theme.text }]}>
          A calm plan for the day
        </Text>
        <View style={styles.focusList}>
          {(focusItems.length
            ? focusItems
            : ["Your day is open. Choose one useful next step."]
          ).map((item) => (
            <View key={item} style={styles.focusRow}>
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.focusText, { color: theme.mutedText }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.summaryGrid}>
          <SummaryMetric
            label="Next priority"
            value={timeline[0] ? formatReminderTime(timeline[0].dueAt) : "Open"}
          />
          <SummaryMetric
            label="Active minutes"
            value={`${fitness?.activeMinutesToday ?? 0} min`}
          />
        </View>
        <View style={styles.heroActions}>
          <AppButton
            onPress={() => router.push("/calendar" as Href)}
            size="sm"
            title="Start day"
          />
          <AppButton
            onPress={() => router.push("/health" as Href)}
            size="sm"
            title="Quick log"
            variant="secondary"
          />
          <AppButton
            onPress={() => router.push("/ai" as Href)}
            size="sm"
            title="Ask AI"
            variant="ghost"
          />
        </View>
      </AppCard>

      <TodayRealmShortcuts
        showChildCare={show("child_care")}
        showFamily={show("family_circle")}
        showFitness={show("fitness")}
        showNutrition={show("nutrition")}
      />

      {empty ? <EmptyDay /> : null}

      <AppSection
        actionLabel="Open calendar"
        onActionPress={() => router.push("/calendar" as Href)}
        subtitle="The most important items to notice first."
        title="Priorities"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priorityStrip}
        >
          {loading ? <StateCard text="Loading today's plan..." /> : null}
          {!loading && !timeline.length ? (
            <StateCard text="No events yet. Your day is open." />
          ) : null}
          {timeline.slice(0, 4).map((item) => (
            <AppCard
              key={item.id}
              onPress={() => router.push(item.route)}
              padding="md"
              style={styles.priorityCard}
            >
              <View
                style={[
                  styles.timelineIcon,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <AppIcon
                  color={theme.primary}
                  decorative
                  name={item.icon}
                  size={18}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[styles.cardTitle, { color: theme.text }]}
              >
                {item.title}
              </Text>
              <Text style={[styles.meta, { color: theme.mutedText }]}>
                {item.type}
              </Text>
              <Text style={[styles.time, { color: theme.primary }]}>
                {formatReminderTime(item.dueAt)}
              </Text>
            </AppCard>
          ))}
        </ScrollView>
      </AppSection>

      <AppSection
        subtitle="A compact view based on your selected modules."
        title="Quick widgets"
      >
        <View style={styles.snapshotGrid}>
          {snapshots.map((item) => (
            <AppCard
              key={item.title}
              onPress={() => router.push(item.route)}
              style={styles.snapshot}
            >
              <View
                style={[
                  styles.widgetIcon,
                  { backgroundColor: realmSoftAccent(item.icon) },
                ]}
              >
                <AppIcon
                  color={realmAccent(item.icon)}
                  decorative
                  name={item.icon}
                  size={20}
                />
              </View>
              <Text style={[styles.snapshotTitle, { color: theme.mutedText }]}>
                {item.title}
              </Text>
              <Text style={[styles.snapshotValue, { color: theme.text }]}>
                {item.value}
              </Text>
              <Text style={[styles.snapshotHelper, { color: theme.mutedText }]}>
                {item.helper}
              </Text>
            </AppCard>
          ))}
        </View>
      </AppSection>

      <AppSection
        subtitle="Open the areas that support your day."
        title="Your modules"
      >
        <View style={styles.moduleGrid}>
          <ModuleCard
            icon="fitness"
            label="Fitness"
            route="/fitness"
            visible={show("fitness")}
          />
          <ModuleCard
            icon="food"
            label="Food & Nutrition"
            route="/food"
            visible={show("nutrition")}
          />
          <ModuleCard
            icon="calendar"
            label="Calendar"
            route="/calendar"
            visible
          />
          <ModuleCard
            icon="caregiver"
            label="Family Circle"
            route="/circle"
            visible={show("family_circle")}
          />
          <ModuleCard
            icon="medication"
            label="Medication"
            route="/medication"
            visible
          />
          <ModuleCard
            icon="health"
            label="Supplements"
            route="/supplements"
            visible
          />
          <ModuleCard icon="records" label="Records" route="/records" visible />
          <ModuleCard
            icon="pregnancy"
            label="Pregnancy"
            route="/pregnancy"
            visible={show("pregnancy")}
          />
          <ModuleCard
            icon="child_baby"
            label="Baby & Child"
            route="/baby-child"
            visible={show("child_care")}
          />
        </View>
      </AppSection>

      <AppSection
        subtitle="Log or create something without hunting through menus."
        title="Quick add"
      >
        <View style={styles.actionGrid}>
          {actions.slice(0, 6).map((action) => (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route)}
              style={[
                styles.action,
                {
                  backgroundColor: theme.card ?? theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <AppIcon
                color={realmAccent(action.icon)}
                decorative
                name={action.icon}
                size={19}
              />
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </AppSection>
    </AppMainLayout>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.summaryMetric,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function ModuleCard({
  icon,
  label,
  route,
  visible,
}: {
  icon: AppIconName;
  label: string;
  route: Href;
  visible: boolean;
}) {
  const { theme } = useAppTheme();
  if (!visible) return null;
  return (
    <AppCard
      onPress={() => router.push(route)}
      padding="md"
      style={styles.moduleCard}
    >
      <View
        style={[
          styles.moduleIcon,
          { backgroundColor: realmAccentWithOpacity(realmKeyForIcon(icon)) },
        ]}
      >
        <AppIcon color={realmAccent(icon)} decorative name={icon} size={20} />
      </View>
      <Text style={[styles.moduleLabel, { color: theme.text }]}>{label}</Text>
    </AppCard>
  );
}

function EmptyDay() {
  const { theme } = useAppTheme();
  return (
    <AppCard variant="soft">
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Let's set up your day
      </Text>
      <Text style={[styles.emptyBody, { color: theme.mutedText }]}>
        Choose one useful next step. You can customize what appears anytime.
      </Text>
      <View style={styles.heroActions}>
        <AppButton
          onPress={() => router.push("/fitness/preferences" as Href)}
          size="sm"
          title="Choose goals"
        />
        <AppButton
          onPress={() => router.push("/calendar" as Href)}
          size="sm"
          title="Add event"
          variant="secondary"
        />
        <AppButton
          onPress={() => router.push("/fitness" as Href)}
          size="sm"
          title="Start workout"
          variant="secondary"
        />
        <AppButton
          onPress={() => router.push("/food" as Href)}
          size="sm"
          title="Log food"
          variant="ghost"
        />
      </View>
    </AppCard>
  );
}

function StateCard({ text }: { text: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={styles.priorityCard} variant="soft">
      <Text style={{ color: theme.mutedText, fontWeight: "800" }}>{text}</Text>
    </AppCard>
  );
}

function buildTimeline(health: HealthReminder[], fitness: AppReminder[]) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const items: TimelineItem[] = [
    ...health.map((item) => ({
      dueAt: item.snoozedUntil ?? item.dueAt,
      icon: reminderIcon(item.type),
      id: `health-${item.id}`,
      route: (item.route ?? reminderRoute(item.type)) as Href,
      title: item.lockedPrivate ? "Private reminder" : item.title,
      type: labelType(item.type),
    })),
    ...fitness
      .filter((item) => item.dueAt.slice(0, 10) === todayKey)
      .map((item) => ({
        dueAt: item.dueAt,
        icon: "fitness" as AppIconName,
        id: `fitness-${item.id}`,
        route: "/calendar" as Href,
        title: item.title,
        type: "Fitness plan",
      })),
  ];
  return items
    .filter(
      (item, index) =>
        items.findIndex(
          (candidate) =>
            candidate.title === item.title && candidate.dueAt === item.dueAt,
        ) === index,
    )
    .sort(
      (left, right) =>
        new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime(),
    );
}

function reminderIcon(type: string): AppIconName {
  if (type === "medication") return "medication";
  if (type === "supplement") return "health";
  if (type === "workout") return "fitness";
  if (type === "meal") return "food";
  if (type === "baby_child") return "child_baby";
  if (type === "pregnancy") return "pregnancy";
  return "calendar";
}

function reminderRoute(type: string): Href {
  if (type === "medication") return "/medication";
  if (type === "supplement") return "/supplements";
  if (type === "workout") return "/fitness";
  if (type === "meal") return "/food";
  if (type === "baby_child") return "/baby-child";
  if (type === "pregnancy") return "/pregnancy";
  return "/calendar";
}

function labelType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTodayDate() {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());
}

function formatShortDate() {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(new Date());
}

function realmAccent(icon: AppIconName) {
  if (icon === "fitness") return healthRealmAccents.fitness;
  if (icon === "food") return healthRealmAccents.food;
  if (icon === "pregnancy") return healthRealmAccents.women;
  if (icon === "child_baby") return healthRealmAccents.baby;
  if (icon === "caregiver" || icon === "calendar")
    return healthRealmAccents.family;
  if (icon === "records") return healthRealmAccents.records;
  if (icon === "medication") return healthRealmAccents.meds;
  return healthRealmAccents.health;
}

function realmKeyForIcon(icon: AppIconName): keyof typeof healthRealmAccents {
  if (icon === "fitness") return "fitness";
  if (icon === "food") return "food";
  if (icon === "pregnancy") return "women";
  if (icon === "child_baby") return "baby";
  if (icon === "caregiver" || icon === "calendar") return "family";
  if (icon === "records") return "records";
  if (icon === "medication") return "meds";
  return "health";
}

function realmSoftAccent(icon: AppIconName) {
  return realmAccentWithOpacity(realmKeyForIcon(icon));
}

function dayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    gap: 7,
    minHeight: 78,
    padding: 11,
  },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  actionLabel: { fontSize: 10, fontWeight: "900", textAlign: "center" },
  cardTitle: { fontSize: 14, fontWeight: "900" },
  customize: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 6,
  },
  customizeText: { fontSize: 11, fontWeight: "900" },
  datePill: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  datePillText: { fontSize: 11, fontWeight: "900" },
  dot: { borderRadius: 999, height: 7, marginTop: 6, width: 7 },
  emptyBody: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  emptyTitle: { fontSize: 20, fontWeight: "900" },
  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  focusList: { gap: 8, marginTop: 14 },
  focusRow: { alignItems: "flex-start", flexDirection: "row", gap: 9 },
  focusText: { flex: 1, fontSize: 12, lineHeight: 18 },
  hero: { borderWidth: 1, overflow: "hidden", padding: 20 },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  heroOrb: {
    borderRadius: 999,
    height: 150,
    opacity: 0.1,
    position: "absolute",
    right: -48,
    top: -48,
    width: 150,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroTitle: { fontSize: 25, fontWeight: "900", marginTop: 4 },
  meta: { fontSize: 10, fontWeight: "800", marginTop: 3 },
  moduleCard: { flexBasis: "47%", flexGrow: 1, gap: 10, minHeight: 128 },
  moduleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  moduleIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  moduleLabel: { fontSize: 13, fontWeight: "900" },
  priorityCard: { gap: 8, minHeight: 138, width: 180 },
  priorityStrip: { gap: 10, paddingBottom: 4 },
  snapshot: { flexBasis: "47%", flexGrow: 1, minHeight: 142 },
  snapshotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  snapshotHelper: { fontSize: 10, lineHeight: 15, marginTop: 5 },
  snapshotTitle: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 12,
    textTransform: "uppercase",
  },
  snapshotValue: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
    marginTop: 4,
  },
  summaryGrid: { flexDirection: "row", gap: 10, marginTop: 16 },
  summaryLabel: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  summaryMetric: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    padding: 12,
  },
  summaryValue: { fontSize: 16, fontWeight: "900" },
  time: { fontSize: 11, fontWeight: "800" },
  timelineIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  widgetIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
