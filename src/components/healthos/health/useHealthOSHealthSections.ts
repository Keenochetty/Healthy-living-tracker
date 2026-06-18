import { useEffect, useMemo, useState } from "react";

import type {
  HealthOSHealthSectionKey,
  HealthOSHealthSectionMeta,
} from "./HealthOSHealthTypes";

export const healthOSHealthSectionMetadata: HealthOSHealthSectionMeta[] = [
  {
    defaultVisible: true,
    description:
      "Shows the latest safe summary for general health metrics such as weight, heart rate, sleep, water, and mood when real logs exist.",
    key: "vitals",
    realm: "general",
    removable: true,
    routeTarget: "/biometrics",
    subtitle: "Weight, heart rate, sleep, water, and mood",
    tips: [
      "Use check-ins to build trends over time.",
      "Large charts stay inside the deeper biometrics area.",
      "Empty values mean no local log exists yet.",
    ],
    title: "Vitals Overview",
  },
  {
    defaultVisible: true,
    description:
      "Shows medication and supplement reminder status so you can quickly see what needs review and open the full schedule.",
    key: "medicationSupplements",
    privacyLevel: "sensitive",
    realm: "medication",
    removable: true,
    routeTarget: "/medication",
    subtitle: "Due, missed, and taken reminders",
    tips: [
      "Scan scripts to create reminders faster.",
      "Review all extracted medicine details before saving.",
      "Use Calendar to see doses alongside appointments.",
    ],
    title: "Medication & Supplements",
  },
  {
    defaultVisible: true,
    description:
      "Combines today fitness and nutrition summaries so active plans are visible without opening each realm.",
    key: "fitnessNutrition",
    realm: "fitness",
    removable: true,
    routeTarget: "/(tabs)/fitness",
    subtitle: "Workout, steps, meals, protein, and hydration",
    tips: [
      "Use Fitness for workouts and Nutrition for food logs.",
      "The hub uses compact progress only.",
      "No targets are invented when no goal is configured.",
    ],
    title: "Fitness & Nutrition",
  },
  {
    defaultVisible: false,
    description:
      "Provides a private entry into cycle, symptom, mood, and contraception tracking when enabled.",
    key: "womenHealth",
    privacyLevel: "private",
    realm: "women",
    removable: true,
    routeTarget: "/cycle",
    subtitle: "Private cycle and symptom tracking",
    tips: [
      "Keep this section visible only when useful for the current profile.",
      "Sensitive details are not exposed in the hub.",
      "Use the full realm for logs and predictions.",
    ],
    title: "Women's Health / Cycle",
  },
  {
    defaultVisible: false,
    description:
      "Provides pregnancy journey access when a pregnancy profile exists or the user chooses to enable it.",
    key: "pregnancy",
    privacyLevel: "private",
    realm: "pregnancy",
    removable: true,
    routeTarget: "/pregnancy",
    subtitle: "Journey, milestones, and checklist access",
    tips: [
      "Pregnancy week appears only from real profile data.",
      "Use the full pregnancy area for appointments and notes.",
      "Emergency symptoms need urgent professional care.",
    ],
    title: "Pregnancy",
  },
  {
    defaultVisible: false,
    description:
      "Provides baby and child health access when child profiles or family setup make it relevant.",
    key: "babyChild",
    privacyLevel: "private",
    realm: "babyChild",
    removable: true,
    routeTarget: "/baby-child",
    subtitle: "Milestones, vaccines, sleep, feeds, and care",
    tips: [
      "Child names and details stay inside the child realm.",
      "The hub can show counts only when profiles exist.",
      "Use Records for vaccine cards and documents.",
    ],
    title: "Baby / Child",
  },
  {
    defaultVisible: true,
    description:
      "Keeps scripts, reports, vaccine cards, doctor notes, and important documents reachable from one compact accordion.",
    key: "records",
    privacyLevel: "sensitive",
    realm: "records",
    removable: true,
    routeTarget: "/records",
    subtitle: "Scripts, vaccine cards, reports, and documents",
    tips: [
      "Upload and scan actions route to existing areas.",
      "Emergency packet is a shortcut foundation in this phase.",
      "Document uploads are not implemented by the hub itself.",
    ],
    title: "Records",
  },
  {
    defaultVisible: true,
    description:
      "Shows source-linked trusted health education from existing content storage when available.",
    key: "trustedContent",
    realm: "content",
    removable: true,
    routeTarget: "/trusted-content",
    subtitle: "Source-linked learning for active health areas",
    tips: [
      "Every article keeps source attribution.",
      "No web scraping or invented article claims are used.",
      "Content is for learning and not medical advice.",
    ],
    title: "Trusted Content / News",
  },
  {
    defaultVisible: true,
    description:
      "Provides a route into supported device and wearable sync setup without adding new native integrations in this phase.",
    key: "deviceSync",
    realm: "devices",
    removable: true,
    routeTarget: "/device-sync",
    subtitle: "Wearables, sleep, workouts, steps, and heart rate",
    tips: [
      "Native device sync is not implemented in this phase.",
      "Use this as the gateway for future integrations.",
      "Connected data should remain permission controlled.",
    ],
    title: "Device Sync",
  },
];

type UseHealthOSHealthSectionsOptions = {
  babyChildRelevant?: boolean;
  pregnancyRelevant?: boolean;
  womenHealthRelevant?: boolean;
};

export function useHealthOSHealthSections({
  babyChildRelevant = false,
  pregnancyRelevant = false,
  womenHealthRelevant = false,
}: UseHealthOSHealthSectionsOptions = {}) {
  const defaultVisibleKeys = useMemo(
    () =>
      healthOSHealthSectionMetadata
        .filter((section) => {
          if (section.key === "womenHealth") return womenHealthRelevant;
          if (section.key === "pregnancy") return pregnancyRelevant;
          if (section.key === "babyChild") return babyChildRelevant;
          return section.defaultVisible;
        })
        .map((section) => section.key),
    [babyChildRelevant, pregnancyRelevant, womenHealthRelevant],
  );
  const [order, setOrder] = useState<HealthOSHealthSectionKey[]>(
    healthOSHealthSectionMetadata.map((section) => section.key),
  );
  const [hiddenKeys, setHiddenKeys] = useState<Set<HealthOSHealthSectionKey>>(
    () =>
      new Set(
        healthOSHealthSectionMetadata
          .filter((section) => !defaultVisibleKeys.includes(section.key))
          .map((section) => section.key),
      ),
  );
  const [activeSectionMenuKey, setActiveSectionMenuKey] =
    useState<HealthOSHealthSectionKey | null>(null);
  const [menuMode, setMenuMode] = useState<"info" | "menu">("menu");

  useEffect(() => {
    setHiddenKeys((current) => {
      const next = new Set(current);
      if (womenHealthRelevant) next.delete("womenHealth");
      if (pregnancyRelevant) next.delete("pregnancy");
      if (babyChildRelevant) next.delete("babyChild");
      return next;
    });
  }, [babyChildRelevant, pregnancyRelevant, womenHealthRelevant]);

  const sections = useMemo(
    () =>
      order
        .map((key) =>
          healthOSHealthSectionMetadata.find((section) => section.key === key),
        )
        .filter(Boolean) as HealthOSHealthSectionMeta[],
    [order],
  );
  const visibleSections = sections.filter((section) => !hiddenKeys.has(section.key));
  const hiddenSections = sections.filter((section) => hiddenKeys.has(section.key));

  function moveSectionUp(key: HealthOSHealthSectionKey) {
    setOrder((current) => {
      const index = current.indexOf(key);
      if (index <= 0) return current;
      const next = [...current];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveSectionDown(key: HealthOSHealthSectionKey) {
    setOrder((current) => {
      const index = current.indexOf(key);
      if (index < 0 || index >= current.length - 1) return current;
      const next = [...current];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function setSectionFirst(key: HealthOSHealthSectionKey) {
    setOrder((current) => [key, ...current.filter((item) => item !== key)]);
  }

  function hideSection(key: HealthOSHealthSectionKey) {
    const section = getSectionInfo(key);
    if (!section?.removable) return;
    setHiddenKeys((current) => new Set([...current, key]));
  }

  function showSection(key: HealthOSHealthSectionKey) {
    setHiddenKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }

  function resetSections() {
    setOrder(healthOSHealthSectionMetadata.map((section) => section.key));
    setHiddenKeys(
      new Set(
        healthOSHealthSectionMetadata
          .filter((section) => !defaultVisibleKeys.includes(section.key))
          .map((section) => section.key),
      ),
    );
    setActiveSectionMenuKey(null);
    setMenuMode("menu");
  }

  function getSectionInfo(key: HealthOSHealthSectionKey) {
    return healthOSHealthSectionMetadata.find((section) => section.key === key);
  }

  return {
    activeSectionMenuKey,
    getSectionInfo,
    hiddenSections,
    hideSection,
    menuMode,
    moveSectionDown,
    moveSectionUp,
    resetSections,
    sections,
    setActiveSectionMenuKey,
    setMenuMode,
    setSectionFirst,
    showSection,
    visibleSections,
  };
}
