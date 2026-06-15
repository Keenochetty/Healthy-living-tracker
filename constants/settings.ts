import type {
  DateFormatPreference,
  DistanceUnitPreference,
  HeightUnitPreference,
  MeasurementSystemPreference,
  TemperatureUnitPreference,
  TimeFormatPreference,
  WeightUnitPreference,
} from "@/types/settings";

export const defaultUnitsPreferences = {
  dateFormat: "device_default",
  distance: "device_default",
  height: "device_default",
  system: "device_default",
  temperature: "device_default",
  timeFormat: "device_default",
  weight: "device_default",
} as const;

export const defaultSettingsPreferences = {
  ai: {
    allowSafeSummaries: true,
    logActionsToAudit: true,
  },
  appearance: {
    reduceMotion: false,
    theme: "device_default",
  },
  notifications: {
    lockSensitiveNotifications: true,
    showSafePreviews: true,
  },
  privacy: {
    caregiverSharingEnabled: true,
    emergencyAccessLogging: true,
    partnerSharingEnabled: false,
  },
  units: defaultUnitsPreferences,
} as const;

export const settingsSections = [
  {
    items: [
      {
        href: "/settings/account",
        label: "Account details",
        subtitle: "Sign-in, email, and account basics.",
      },
      {
        href: "/settings/profile",
        label: "Profile",
        subtitle: "Name, display name, role, and avatar.",
      },
    ],
    title: "Account",
  },
  {
    items: [
      {
        href: "/settings/family",
        label: "Family members",
        subtitle: "Household members and family profile.",
      },
      {
        href: "/settings/privacy",
        label: "Privacy & sharing",
        subtitle: "Family, partner, caregiver, and emergency sharing.",
      },
      {
        href: "/settings/emergency-contacts",
        label: "Emergency contacts",
        subtitle: "Important contacts for urgent care moments.",
      },
    ],
    title: "Family & Sharing",
  },
  {
    items: [
      {
        href: "/settings/caregiver-access",
        label: "Caregiver access",
        subtitle: "Permissions for caregiver child access.",
      },
    ],
    title: "Caregiver Access",
  },
  {
    items: [
      {
        href: "/settings/notifications",
        label: "Notifications",
        subtitle: "Safe previews and alert preferences.",
      },
      {
        href: "/settings/appearance",
        label: "Appearance",
        subtitle: "Theme and motion preferences.",
      },
      {
        href: "/settings/units",
        label: "Units & measurements",
        subtitle: "Metric, imperial, and device defaults.",
      },
      {
        href: "/settings/language-region",
        label: "Language & region",
        subtitle: "Locale, region, time, and date preferences.",
      },
    ],
    title: "App Preferences",
  },
  {
    items: [
      {
        href: "/settings/calendar-sync",
        label: "Calendar sync",
        subtitle: "External calendar sync placeholders.",
      },
      {
        href: "/settings/voice-assistant",
        label: "Voice assistant",
        subtitle: "Voice control placeholders.",
      },
    ],
    title: "Connected Services",
  },
  {
    items: [
      {
        href: "/settings/security",
        label: "App lock",
        subtitle: "PIN, biometric, and session timeout preferences.",
      },
      {
        href: "/settings/security",
        label: "Sensitive previews",
        subtitle: "Lock sensitive notification detail.",
      },
      {
        href: "/settings/ai-assistant",
        label: "AI assistant",
        subtitle: "Assistant summaries and access preferences.",
      },
      {
        href: "/settings/audit-history",
        label: "Audit history",
        subtitle: "Security and AI action history placeholders.",
      },
    ],
    title: "Security",
  },
  {
    items: [
      {
        href: "/settings/help",
        label: "Help",
        subtitle: "Guidance and support placeholders.",
      },
      {
        href: "/settings/about",
        label: "About",
        subtitle: "App version, status, and legal basics.",
      },
    ],
    title: "Support",
  },
] as const;

export const measurementSystemOptions: Array<{
  label: string;
  value: MeasurementSystemPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "Metric", value: "metric" },
  { label: "Imperial", value: "imperial" },
];

export const weightUnitOptions: Array<{
  label: string;
  value: WeightUnitPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "kg", value: "kg" },
  { label: "lb", value: "lb" },
];

export const heightUnitOptions: Array<{
  label: string;
  value: HeightUnitPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "cm", value: "cm" },
  { label: "ft/in", value: "ft_in" },
];

export const temperatureUnitOptions: Array<{
  label: string;
  value: TemperatureUnitPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "Celsius", value: "celsius" },
  { label: "Fahrenheit", value: "fahrenheit" },
];

export const distanceUnitOptions: Array<{
  label: string;
  value: DistanceUnitPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "km", value: "km" },
  { label: "miles", value: "miles" },
];

export const timeFormatOptions: Array<{
  label: string;
  value: TimeFormatPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "12-hour", value: "12_hour" },
  { label: "24-hour", value: "24_hour" },
];

export const dateFormatOptions: Array<{
  label: string;
  value: DateFormatPreference;
}> = [
  { label: "Device", value: "device_default" },
  { label: "DD-MM-YYYY", value: "dd_mm_yyyy" },
  { label: "MM-DD-YYYY", value: "mm_dd_yyyy" },
];
