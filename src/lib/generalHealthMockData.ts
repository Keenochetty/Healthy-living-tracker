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

export const MOCK_GENERAL_HEALTH_STATE: GeneralHealthMockState = "ready";
export const GENERAL_HEALTH_MOCK_PROFILE = { id: "mock-profile-you", name: "You" } as const;

function mockActivityDate(daysAgo: number, minutesAgo: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// TODO: Replace mock activity with health activity loaded for the selected profile through the approved data layer.
export const GENERAL_HEALTH_ACTIVITY: GeneralHealthActivityEntry[] = [
  {
    createdAt: mockActivityDate(0, 35),
    id: "mock-activity-vitals",
    details: { diastolic: "78", heartRate: "78", oxygen: "98", systolic: "122" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "Heart rate 78 bpm · Blood pressure 122 / 78 mmHg · Oxygen 98%",
    title: "Vitals logged",
    type: "vitals"
  },
  {
    createdAt: mockActivityDate(0, 210),
    id: "mock-activity-weight",
    details: { weight: "72.2" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "72.2 kg",
    title: "Weight added",
    type: "weight"
  },
  {
    createdAt: mockActivityDate(12, 95),
    id: "mock-activity-weight-earlier",
    details: { notes: "Morning entry.", weight: "72.5" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "72.5 kg",
    title: "Weight added",
    type: "weight"
  },
  {
    createdAt: mockActivityDate(24, 130),
    id: "mock-activity-weight-oldest",
    details: { weight: "71.9" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "71.9 kg",
    title: "Weight added",
    type: "weight"
  },
  {
    createdAt: mockActivityDate(1, 75),
    id: "mock-activity-note",
    details: {
      category: "General",
      details: "Saved after a long day at the desk to discuss later if needed.",
      noteTitle: "Mild headache after long workday"
    },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "Mild headache after long workday",
    title: "Health note added",
    type: "note"
  },
  {
    createdAt: mockActivityDate(3, 20),
    id: "mock-activity-temperature",
    details: { method: "Oral", temperature: "36.7" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "36.7 °C · Oral",
    title: "Temperature logged",
    type: "temperature"
  },
  {
    createdAt: mockActivityDate(4, 85),
    id: "mock-activity-temperature-earlier",
    details: { method: "Ear", notes: "Saved before bedtime.", temperature: "36.9" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "36.9 \u00B0C \u00B7 Ear",
    title: "Temperature logged",
    type: "temperature"
  },
  {
    createdAt: mockActivityDate(6, 115),
    id: "mock-activity-temperature-oldest",
    details: { method: "Oral", temperature: "36.5" },
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "36.5 \u00B0C \u00B7 Oral",
    title: "Temperature logged",
    type: "temperature"
  },
  {
    createdAt: mockActivityDate(4, 40),
    details: { diastolic: "76", heartRate: "75", oxygen: "97", systolic: "118" },
    id: "mock-activity-heart-rate-earlier",
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "Heart rate 75 bpm · Blood pressure 118 / 76 mmHg · Oxygen 97%",
    title: "Vitals logged",
    type: "vitals"
  },
  {
    createdAt: mockActivityDate(6, 55),
    details: { diastolic: "81", heartRate: "81", notes: "Saved after an afternoon walk.", oxygen: "99", systolic: "124" },
    id: "mock-activity-heart-rate-oldest",
    profileId: GENERAL_HEALTH_MOCK_PROFILE.id,
    profileName: GENERAL_HEALTH_MOCK_PROFILE.name,
    summary: "Heart rate 81 bpm · Blood pressure 124 / 81 mmHg · Oxygen 99%",
    title: "Vitals logged",
    type: "vitals"
  }
];

export const GENERAL_HEALTH_SNAPSHOT: GeneralHealthSnapshotItem[] = [
  { icon: "vitals", label: "Heart", status: "usual", value: "78 bpm" },
  { icon: "weight", label: "Weight", status: "stable", value: "72.2 kg" },
  { icon: "sleep", label: "Sleep", status: "logged", value: "6h 40m" },
  { icon: "water", label: "Water", status: "today", value: "1.2 L" }
];

export const GENERAL_HEALTH_QUICK_ACTIONS: GeneralHealthQuickAction[] = [
  { accessibilityHint: "Opens a form to add vital readings", accessibilityLabel: "Add vitals log", icon: "vitals", label: "Add vitals", logType: "vitals" },
  { accessibilityHint: "Opens a form to add a weight entry", accessibilityLabel: "Open weight log", icon: "weight", label: "Add weight", logType: "weight" },
  { accessibilityHint: "Opens a form to add a health note", accessibilityLabel: "Add general health note", icon: "edit", label: "Add note", logType: "note" },
  { accessibilityHint: "Opens a form to add a temperature reading", accessibilityLabel: "Add temperature log", icon: "biometrics", label: "Add temperature", logType: "temperature" }
];

export const GENERAL_HEALTH_VITALS: GeneralHealthVital[] = [
  { icon: "vitals", label: "Heart rate", status: "usual", updated: "Updated today", value: "78 bpm" },
  // TODO: Apply the profile's preferred unit setting when real logging is connected.
  { icon: "biometrics", label: "Temperature", status: "logged", updated: "Updated yesterday", value: "36.7 \u00B0C" },
  { icon: "health", label: "Blood pressure", status: "saved", updated: "Updated Monday", value: "122 / 78 mmHg" },
  { icon: "device_sync", label: "Oxygen saturation", status: "saved", updated: "Updated today", value: "98%" }
];

export const GENERAL_HEALTH_BODY_METRICS: GeneralHealthBodyMetric[] = [
  { icon: "weight", label: "Weight", status: "stable", value: "72.2 kg" },
  { icon: "biometrics", label: "Height", status: "saved", value: "175 cm" },
  { icon: "health", label: "BMI", status: "future calculated field", value: "Coming soon" },
  { icon: "edit", label: "Body goal", status: "planned", value: "Maintain" }
];

export const GENERAL_HEALTH_WEEK = [
  { day: "Mon", logged: true, value: 46 },
  { day: "Tue", logged: false, value: 18 },
  { day: "Wed", logged: true, value: 68 },
  { day: "Thu", logged: true, value: 52 },
  { day: "Fri", logged: false, value: 24 },
  { day: "Sat", logged: true, value: 78 },
  { day: "Sun", logged: false, value: 16 }
];

export const GENERAL_HEALTH_NOTES: GeneralHealthNote[] = [
  {
    body: "Saved after a long day at the desk to discuss later if needed.",
    category: "Personal note",
    createdAt: "Today, 5:20 PM",
    title: "Mild headache after long workday"
  },
  {
    body: "A short note about energy and the morning routine.",
    category: "Wellness note",
    createdAt: "Yesterday, 9:10 AM",
    title: "Felt more energetic after morning walk"
  }
];
