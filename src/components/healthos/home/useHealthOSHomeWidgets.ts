import { useMemo, useState } from "react";
import type { Href } from "expo-router";

export type HealthOSHomeWidgetKey =
  | "todayTimeline"
  | "healthSnapshot"
  | "medicationDue"
  | "fitnessNutrition"
  | "familyPulse"
  | "aiSuggestion"
  | "upcomingEvents"
  | "recordsShortcut";

export type HealthOSHomeWidgetMetadata = {
  defaultVisible: boolean;
  description: string;
  key: HealthOSHomeWidgetKey;
  removable: boolean;
  routeTarget?: Href;
  tips: string[];
  title: string;
};

export const defaultHealthOSHomeWidgetOrder: HealthOSHomeWidgetKey[] = [
  "todayTimeline",
  "healthSnapshot",
  "medicationDue",
  "fitnessNutrition",
  "familyPulse",
  "aiSuggestion",
  "upcomingEvents",
  "recordsShortcut",
];

export const healthOSHomeWidgetMetadata: Record<
  HealthOSHomeWidgetKey,
  HealthOSHomeWidgetMetadata
> = {
  todayTimeline: {
    defaultVisible: true,
    description:
      "Shows a compact view of today's planned health items, reminders, appointments, and care tasks when they are available.",
    key: "todayTimeline",
    removable: true,
    routeTarget: "/(tabs)/calendar" as Href,
    tips: [
      "Tap the widget to open Calendar.",
      "Long press any widget to manage it.",
      "Future phases can connect richer calendar and reminder data here.",
    ],
    title: "Today Timeline",
  },
  healthSnapshot: {
    defaultVisible: true,
    description:
      "Shows your latest health metrics and small trend placeholders so you can notice what needs logging without opening every tracker.",
    key: "healthSnapshot",
    removable: true,
    routeTarget: "/(tabs)/health" as Href,
    tips: [
      "Use Health to add detailed check-ins.",
      "Device sync can fill this automatically later.",
      "No personal values are shown until they are logged.",
    ],
    title: "Health Snapshot",
  },
  medicationDue: {
    defaultVisible: true,
    description:
      "Keeps medication and supplement schedule attention visible without giving medication advice.",
    key: "medicationDue",
    removable: true,
    routeTarget: "/medication" as Href,
    tips: [
      "Always follow your label and healthcare professional instructions.",
      "Tap to open Medication.",
      "Confirm/snooze actions can be wired when existing logic is ready.",
    ],
    title: "Medication Due",
  },
  fitnessNutrition: {
    defaultVisible: true,
    description:
      "Combines movement and nutrition setup prompts so wellness planning stays visible but compact.",
    key: "fitnessNutrition",
    removable: true,
    routeTarget: "/(tabs)/fitness" as Href,
    tips: [
      "Open Fitness or Food to add real logs.",
      "The ring is a placeholder until progress data is connected.",
      "Keep goals practical and adjustable.",
    ],
    title: "Fitness / Nutrition",
  },
  familyPulse: {
    defaultVisible: true,
    description:
      "Shows family and Circle updates only when shared data exists and permissions allow it.",
    key: "familyPulse",
    removable: true,
    routeTarget: "/(tabs)/circle" as Href,
    tips: [
      "Invite family only when you are ready.",
      "Shared health data should remain opt-in.",
      "No fake family names are shown on Home.",
    ],
    title: "Family Pulse",
  },
  aiSuggestion: {
    defaultVisible: true,
    description:
      "Surfaces one helpful AI or scan suggestion without opening popups or calling the AI backend.",
    key: "aiSuggestion",
    removable: true,
    routeTarget: "/(tabs)/scan" as Href,
    tips: [
      "Use Scan for labels, scripts, or records.",
      "AI suggestions stay quiet and dismissible.",
      "This widget does not call AI in this phase.",
    ],
    title: "AI Suggestion",
  },
  upcomingEvents: {
    defaultVisible: true,
    description:
      "Shows upcoming calendar or reminder items when those data sources are connected.",
    key: "upcomingEvents",
    removable: true,
    routeTarget: "/(tabs)/calendar" as Href,
    tips: [
      "Tap to open Calendar.",
      "Events are empty until real data is available.",
      "Future phases can merge family and medication schedules here.",
    ],
    title: "Upcoming Events",
  },
  recordsShortcut: {
    defaultVisible: true,
    description:
      "Gives quick access to medical documents, scripts, vaccine cards, reports, and scan flows.",
    key: "recordsShortcut",
    removable: true,
    routeTarget: "/records" as Href,
    tips: [
      "Tap to open Records.",
      "Uploads and scans stay in their existing screens.",
      "Private storage rules are not changed by this widget.",
    ],
    title: "Records Shortcut",
  },
};

export function useHealthOSHomeWidgets() {
  const [visibleKeys, setVisibleKeys] = useState<HealthOSHomeWidgetKey[]>(
    defaultHealthOSHomeWidgetOrder.filter(
      (key) => healthOSHomeWidgetMetadata[key].defaultVisible,
    ),
  );

  const visibleWidgets = useMemo(
    () => visibleKeys.map((key) => healthOSHomeWidgetMetadata[key]),
    [visibleKeys],
  );

  const hiddenWidgets = useMemo(
    () =>
      defaultHealthOSHomeWidgetOrder
        .filter((key) => !visibleKeys.includes(key))
        .map((key) => healthOSHomeWidgetMetadata[key]),
    [visibleKeys],
  );

  function removeWidget(widgetKey: HealthOSHomeWidgetKey) {
    const widget = healthOSHomeWidgetMetadata[widgetKey];
    if (!widget.removable) return;
    setVisibleKeys((current) => current.filter((key) => key !== widgetKey));
  }

  function addWidget(widgetKey: HealthOSHomeWidgetKey) {
    setVisibleKeys((current) => {
      if (current.includes(widgetKey)) return current;
      return defaultHealthOSHomeWidgetOrder.filter(
        (key) => current.includes(key) || key === widgetKey,
      );
    });
  }

  function resetWidgets() {
    setVisibleKeys(
      defaultHealthOSHomeWidgetOrder.filter(
        (key) => healthOSHomeWidgetMetadata[key].defaultVisible,
      ),
    );
  }

  return {
    addWidget,
    hiddenWidgets,
    removeWidget,
    resetWidgets,
    visibleWidgets,
  };
}
