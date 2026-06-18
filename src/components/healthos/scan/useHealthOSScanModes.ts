import { useMemo, useState } from "react";

import type {
  HealthOSScanImportTarget,
  HealthOSScanMode,
  HealthOSScanModeConfig,
} from "./HealthOSScanTypes";

export const healthOSScanModes: HealthOSScanModeConfig[] = [
  {
    hint: "Point at anything you want to organize, then decide what to do after capture.",
    icon: "ai",
    importTargets: ["ai", "records", "calendar"],
    key: "general",
    label: "Ask AI",
  },
  {
    hint: "Fit the nutrition label or barcode inside the frame.",
    icon: "food",
    importTargets: ["nutrition", "records"],
    key: "foodLabel",
    label: "Food label",
  },
  {
    hint: "Capture the medication name, dosage, and directions clearly.",
    icon: "medication",
    importTargets: ["medication", "records", "calendar"],
    key: "medication",
    label: "Medication",
    safetyNote: "Confirm medication instructions with your healthcare professional.",
  },
  {
    hint: "Keep the script flat and readable in good lighting.",
    icon: "documents",
    importTargets: ["medication", "records", "calendar"],
    key: "script",
    label: "Script",
    safetyNote: "Review prescriptions before saving anything.",
  },
  {
    hint: "Capture the note, report, or instruction page edge to edge.",
    icon: "doctor",
    importTargets: ["records", "calendar", "ai"],
    key: "doctorNote",
    label: "Doctor note",
  },
  {
    hint: "Capture supplement name, strength, and serving instructions.",
    icon: "health",
    importTargets: ["supplements", "records", "calendar"],
    key: "supplement",
    label: "Supplement",
  },
  {
    hint: "Capture the machine name or the full equipment view.",
    icon: "fitness",
    importTargets: ["fitness", "records", "ai"],
    key: "gymMachine",
    label: "Gym machine",
  },
  {
    hint: "Capture the whole meal plan so sections remain readable.",
    icon: "nutrition",
    importTargets: ["nutrition", "calendar", "records"],
    key: "mealPlan",
    label: "Meal plan",
  },
  {
    hint: "Place the full document inside the frame with clear lighting.",
    icon: "records",
    importTargets: ["records", "calendar"],
    key: "record",
    label: "Record",
  },
  {
    hint: "Capture appointment notes or pregnancy documents clearly.",
    icon: "pregnancy",
    importTargets: ["pregnancy", "records", "calendar"],
    key: "pregnancy",
    label: "Pregnancy",
  },
  {
    hint: "Capture baby or child care documents without cutting off dates.",
    icon: "child_baby",
    importTargets: ["babyChild", "records", "calendar"],
    key: "babyChild",
    label: "Baby/Child",
  },
  {
    hint: "Capture women’s health notes privately and review before saving.",
    icon: "pregnancy_cycle",
    importTargets: ["womenHealth", "records", "calendar"],
    key: "womenHealth",
    label: "Women’s Health",
  },
];

export function useHealthOSScanModes() {
  const [selectedMode, setSelectedMode] = useState<HealthOSScanMode>("general");

  const selectedModeConfig = useMemo(
    () =>
      healthOSScanModes.find((mode) => mode.key === selectedMode) ??
      healthOSScanModes[0],
    [selectedMode],
  );

  function getImportTargetsForMode(mode: HealthOSScanMode): HealthOSScanImportTarget[] {
    return (
      healthOSScanModes.find((candidate) => candidate.key === mode)
        ?.importTargets ?? []
    );
  }

  return {
    getImportTargetsForMode,
    modes: healthOSScanModes,
    selectedMode,
    selectedModeConfig,
    selectedModeHint: selectedModeConfig.hint,
    selectedModeLabel: selectedModeConfig.label,
    setSelectedMode,
  };
}
