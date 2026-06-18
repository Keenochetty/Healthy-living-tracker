import type { AppIconName } from "@/constants/appIcons";

export type GeneralHealthMockState = "empty" | "error" | "loading" | "ready";
export type GeneralHealthLogType = "note" | "temperature" | "vitals" | "weight";
export type GeneralHealthActivityType = GeneralHealthLogType;

type GeneralHealthActivityBase = {
  createdAt: string;
  id: string;
  profileId: string;
  profileName: string;
  summary: string;
  title: string;
};

export type GeneralHealthActivityEntry =
  | (GeneralHealthActivityBase & {
      details: {
        diastolic?: string;
        heartRate?: string;
        notes?: string;
        oxygen?: string;
        systolic?: string;
      };
      type: "vitals";
    })
  | (GeneralHealthActivityBase & {
      details: {
        notes?: string;
        weight?: string;
      };
      type: "weight";
    })
  | (GeneralHealthActivityBase & {
      details: {
        method?: string;
        notes?: string;
        temperature?: string;
      };
      type: "temperature";
    })
  | (GeneralHealthActivityBase & {
      details: {
        category?: string;
        details?: string;
        noteTitle?: string;
      };
      type: "note";
    });

export type GeneralHealthLogDraft = {
  category?: string;
  details?: string;
  diastolic?: string;
  heartRate?: string;
  logType: GeneralHealthLogType;
  method?: string;
  notes?: string;
  noteTitle?: string;
  oxygen?: string;
  recordedAt: string;
  systolic?: string;
  temperature?: string;
  weight?: string;
};

export type GeneralHealthSnapshotItem = {
  icon: AppIconName;
  label: string;
  status: string;
  value: string;
};

export type GeneralHealthQuickAction = {
  accessibilityLabel: string;
  accessibilityHint: string;
  icon: AppIconName;
  label: string;
  logType: GeneralHealthLogType;
};

export type GeneralHealthVital = {
  icon: AppIconName;
  label: string;
  status: string;
  updated: string;
  value: string;
};

export type GeneralHealthBodyMetric = {
  icon: AppIconName;
  label: string;
  status: string;
  value: string;
};

export type GeneralHealthNote = {
  body: string;
  category: string;
  createdAt: string;
  title: string;
};

export const MOCK_GENERAL_HEALTH_STATE: GeneralHealthMockState = "empty";
export const GENERAL_HEALTH_MOCK_PROFILE = {
  id: "local-profile",
  name: "You",
} as const;

export const GENERAL_HEALTH_ACTIVITY: GeneralHealthActivityEntry[] = [];

export const GENERAL_HEALTH_SNAPSHOT: GeneralHealthSnapshotItem[] = [
  { icon: "vitals", label: "Heart", status: "not connected", value: "No data" },
  { icon: "weight", label: "Weight", status: "not connected", value: "No data" },
  { icon: "sleep", label: "Sleep", status: "not connected", value: "No data" },
  { icon: "water", label: "Water", status: "not connected", value: "No data" },
];

export const GENERAL_HEALTH_QUICK_ACTIONS: GeneralHealthQuickAction[] = [
  {
    accessibilityHint: "Opens a form to add vital readings",
    accessibilityLabel: "Add vitals log",
    icon: "vitals",
    label: "Add vitals",
    logType: "vitals",
  },
  {
    accessibilityHint: "Opens a form to add a weight entry",
    accessibilityLabel: "Open weight log",
    icon: "weight",
    label: "Add weight",
    logType: "weight",
  },
  {
    accessibilityHint: "Opens a form to add a health note",
    accessibilityLabel: "Add general health note",
    icon: "edit",
    label: "Add note",
    logType: "note",
  },
  {
    accessibilityHint: "Opens a form to add a temperature reading",
    accessibilityLabel: "Add temperature log",
    icon: "biometrics",
    label: "Add temperature",
    logType: "temperature",
  },
];

export const GENERAL_HEALTH_VITALS: GeneralHealthVital[] = [
  {
    icon: "vitals",
    label: "Heart rate",
    status: "not connected",
    updated: "No data added yet",
    value: "No data",
  },
  {
    icon: "biometrics",
    label: "Temperature",
    status: "not connected",
    updated: "No data added yet",
    value: "No data",
  },
  {
    icon: "health",
    label: "Blood pressure",
    status: "not connected",
    updated: "No data added yet",
    value: "No data",
  },
  {
    icon: "device_sync",
    label: "Oxygen saturation",
    status: "not connected",
    updated: "No data added yet",
    value: "No data",
  },
];

export const GENERAL_HEALTH_BODY_METRICS: GeneralHealthBodyMetric[] = [
  { icon: "weight", label: "Weight", status: "not connected", value: "No data" },
  { icon: "biometrics", label: "Height", status: "not connected", value: "No data" },
  {
    icon: "health",
    label: "BMI",
    status: "future calculated field",
    value: "Coming soon",
  },
  { icon: "edit", label: "Body goal", status: "not connected", value: "No data" },
];

export const GENERAL_HEALTH_WEEK = [
  { day: "Mon", logged: false, value: 0 },
  { day: "Tue", logged: false, value: 0 },
  { day: "Wed", logged: false, value: 0 },
  { day: "Thu", logged: false, value: 0 },
  { day: "Fri", logged: false, value: 0 },
  { day: "Sat", logged: false, value: 0 },
  { day: "Sun", logged: false, value: 0 },
];

export const GENERAL_HEALTH_NOTES: GeneralHealthNote[] = [];
