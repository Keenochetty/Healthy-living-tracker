import { Href, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  HealthOSGlassMenu,
  type HealthOSGlassMenuItem,
} from "@/components/healthos/HealthOSGlassMenu";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import type { AppIconName } from "@/constants/appIcons";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import { getFitnessCalendarReminders } from "@/services/fitnessPlanActivationService";
import { getRemindersForDate } from "@/services/reminders/reminderEngine";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthReminder } from "@/types/healthTimeline";
import type { AppReminder } from "@/types/reminders";
import { HealthOSAISuggestionWidget } from "./HealthOSAISuggestionWidget";
import { HealthOSFamilyPulseWidget } from "./HealthOSFamilyPulseWidget";
import { HealthOSFitnessNutritionWidget } from "./HealthOSFitnessNutritionWidget";
import { HealthOSHealthSnapshotWidget } from "./HealthOSHealthSnapshotWidget";
import { HealthOSHomeHero } from "./HealthOSHomeHero";
import { HealthOSHomeWidgetGrid } from "./HealthOSHomeWidgetGrid";
import { HealthOSMedicationDueWidget } from "./HealthOSMedicationDueWidget";
import { HealthOSPrimaryAttentionCard } from "./HealthOSPrimaryAttentionCard";
import { HealthOSQuickActionRow } from "./HealthOSQuickActionRow";
import { HealthOSRecordsShortcutWidget } from "./HealthOSRecordsShortcutWidget";
import { HealthOSTodayTimelineWidget } from "./HealthOSTodayTimelineWidget";
import { HealthOSUpcomingEventsWidget } from "./HealthOSUpcomingEventsWidget";
import {
  type HealthOSHomeWidgetMetadata,
  useHealthOSHomeWidgets,
} from "./useHealthOSHomeWidgets";
import type {
  HealthOSHomeSummaries,
  HealthOSHomeTimelineItem,
} from "./HealthOSHomeTypes";

type MenuMode = "info" | "menu";

export function HealthOSHomeScreen() {
  const { activeProfile } = useActiveProfile();
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const { addWidget, hiddenWidgets, removeWidget, resetWidgets, visibleWidgets } =
    useHealthOSHomeWidgets();
  const [activeWidget, setActiveWidget] =
    useState<HealthOSHomeWidgetMetadata | null>(null);
  const [menuMode, setMenuMode] = useState<MenuMode>("menu");
  const [timeline, setTimeline] = useState<HealthOSHomeTimelineItem[]>([]);
  const [summaries, setSummaries] = useState<HealthOSHomeSummaries>({
    fitness: null,
    nutrition: null,
  });

  const loadHomeData = useCallback(async () => {
    const [healthReminders, fitnessEvents, fitnessSummary, nutritionSummary] =
      await Promise.all([
        getRemindersForDate(new Date()).catch(() => []),
        getFitnessCalendarReminders().catch(() => []),
        getTodayFitnessSummary().catch(() => null),
        getTodayNutritionSummary().catch(() => null),
      ]);

    setTimeline(buildTimeline(healthReminders, fitnessEvents));
    setSummaries({
      fitness: fitnessSummary,
      nutrition: nutritionSummary,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData().catch(() => {
        setTimeline([]);
        setSummaries({ fitness: null, nutrition: null });
      });
    }, [loadHomeData]),
  );

  const menuItems: HealthOSGlassMenuItem[] = activeWidget
    ? [
        {
          key: "information",
          label: "Information",
          onPress: () => {
            setActiveWidget(activeWidget);
            setMenuMode("info");
          },
          subtitle: "What this widget does",
        },
        {
          key: "manage",
          label: "Manage widget",
          onPress: () => {
            setActiveWidget({
              ...activeWidget,
              description: `${activeWidget.description} Full widget management, persistence, and reorder will be added in a later phase.`,
              tips: [
                ...activeWidget.tips,
                "This phase keeps management local to the current session.",
              ],
            });
            setMenuMode("info");
          },
          subtitle: "Placeholder for a future manager",
        },
        ...(activeWidget.removable
          ? [
              {
                destructive: true,
                key: "remove",
                label: "Remove from Home",
                onPress: () => removeWidget(activeWidget.key),
                subtitle: "Hides this widget for this session",
              },
            ]
          : []),
      ]
    : [];

  function openWidgetMenu(widget: HealthOSHomeWidgetMetadata) {
    setActiveWidget(widget);
    setMenuMode("menu");
  }

  function closeWidgetMenu() {
    setActiveWidget(null);
    setMenuMode("menu");
  }

  return (
    <HealthOSAppShell
      activeNavKey="home"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Today"
      testID="healthos-home-screen"
      title="HealthOS"
      withBottomNavSpace={false}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HealthOSHomeHero
            attentionCount={timeline.length}
            displayName={activeProfile?.displayName}
          />
          <HealthOSPrimaryAttentionCard nextItem={timeline[0]} />
          <HealthOSQuickActionRow />
          <HealthOSHomeWidgetGrid>
            {visibleWidgets.map((widget) => (
              <View key={widget.key}>
                {renderWidget(widget, {
                  summaries,
                  onDismissAISuggestion: () => removeWidget("aiSuggestion"),
                  onLongPress: () => openWidgetMenu(widget),
                  timeline,
                })}
              </View>
            ))}
          </HealthOSHomeWidgetGrid>
          {hiddenWidgets.length ? (
            <HealthOSCard
              subtitle="Session-only visibility controls"
              title="Hidden widgets"
              variant="compact"
            >
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {hiddenWidgets.map((widget) => widget.title).join(", ")}
              </Text>
              <View style={styles.hiddenActions}>
                {hiddenWidgets.map((widget) => (
                  <Text
                    accessibilityRole="button"
                    key={widget.key}
                    onPress={() => addWidget(widget.key)}
                    style={[healthOSTypography.buttonLabel, { color: palette.skyBlue }]}
                  >
                    Add {widget.title}
                  </Text>
                ))}
                <Text
                  accessibilityRole="button"
                  onPress={resetWidgets}
                  style={[healthOSTypography.buttonLabel, { color: palette.skyBlue }]}
                >
                  Reset Home
                </Text>
              </View>
            </HealthOSCard>
          ) : null}
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            Widgets use empty states until real logs, reminders, records, and shared
            family data are available.
          </Text>
        </View>
      </ScrollView>
      <HealthOSGlassMenu
        infoBody={activeWidget?.description}
        infoTips={activeWidget?.tips}
        infoTitle={activeWidget?.title}
        items={menuItems}
        mode={menuMode}
        onClose={closeWidgetMenu}
        testID="healthos-home-widget-menu"
        visible={Boolean(activeWidget)}
      />
    </HealthOSAppShell>
  );
}

function renderWidget(
  widget: HealthOSHomeWidgetMetadata,
  handlers: {
    summaries: HealthOSHomeSummaries;
    onDismissAISuggestion: () => void;
    onLongPress: () => void;
    timeline: HealthOSHomeTimelineItem[];
  },
) {
  switch (widget.key) {
    case "todayTimeline":
      return (
        <HealthOSTodayTimelineWidget
          items={handlers.timeline}
          onLongPress={handlers.onLongPress}
        />
      );
    case "healthSnapshot":
      return (
        <HealthOSHealthSnapshotWidget
          onLongPress={handlers.onLongPress}
          summaries={handlers.summaries}
        />
      );
    case "medicationDue":
      return <HealthOSMedicationDueWidget onLongPress={handlers.onLongPress} />;
    case "fitnessNutrition":
      return (
        <HealthOSFitnessNutritionWidget
          onLongPress={handlers.onLongPress}
          summaries={handlers.summaries}
        />
      );
    case "familyPulse":
      return <HealthOSFamilyPulseWidget onLongPress={handlers.onLongPress} />;
    case "aiSuggestion":
      return (
        <HealthOSAISuggestionWidget
          onDismiss={handlers.onDismissAISuggestion}
          onLongPress={handlers.onLongPress}
        />
      );
    case "upcomingEvents":
      return (
        <HealthOSUpcomingEventsWidget
          items={handlers.timeline.slice(0, 2)}
          onLongPress={handlers.onLongPress}
        />
      );
    case "recordsShortcut":
      return <HealthOSRecordsShortcutWidget onLongPress={handlers.onLongPress} />;
    default:
      return null;
  }
}

function buildTimeline(
  health: HealthReminder[],
  fitness: AppReminder[],
): HealthOSHomeTimelineItem[] {
  const todayKey = new Date().toISOString().slice(0, 10);
  const items: HealthOSHomeTimelineItem[] = [
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
        route: "/(tabs)/calendar" as Href,
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
  if (type === "medication") return "/medication" as Href;
  if (type === "supplement") return "/supplements" as Href;
  if (type === "workout") return "/(tabs)/fitness" as Href;
  if (type === "meal") return "/(tabs)/food" as Href;
  if (type === "baby_child") return "/baby-child" as Href;
  if (type === "pregnancy") return "/pregnancy" as Href;
  return "/(tabs)/calendar" as Href;
}

function labelType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: healthOSSpacing.lg,
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
  hiddenActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.md,
  },
  scrollContent: {
    paddingBottom: healthOSSafeArea.bottomNavSpace + 28,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.md,
  },
});
