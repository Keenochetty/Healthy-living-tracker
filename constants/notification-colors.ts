import { colors } from "@/constants/theme";

export const notificationTypes = {
  greenNormalUpdate: "green_normal_update",
  blueCalendarActivity: "blue_calendar_activity",
  yellowAttention: "yellow_attention",
  orangeImportantHealth: "orange_important_health",
  redEmergency: "red_emergency",
  purpleAiSuggestion: "purple_ai_suggestion",
  greySystem: "grey_system",
} as const;

export type NotificationType =
  (typeof notificationTypes)[keyof typeof notificationTypes];

export type NotificationColorToken = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  meaning: string;
};

export const notificationColorTokens: Record<
  NotificationType,
  NotificationColorToken
> = {
  blue_calendar_activity: {
    accentColor: colors.brand.primary,
    backgroundColor: colors.accent.sky,
    borderColor: "#B7D8FF",
    meaning:
      "Calendar activity, routines, appointments, and scheduling updates.",
    textColor: colors.brand.primary,
  },
  green_normal_update: {
    accentColor: colors.status.success,
    backgroundColor: colors.status.successSoft,
    borderColor: "#B9E9D7",
    meaning:
      "Normal family or care update that does not need urgent attention.",
    textColor: colors.status.success,
  },
  grey_system: {
    accentColor: colors.status.system,
    backgroundColor: colors.status.systemSoft,
    borderColor: "#CBD5E1",
    meaning: "System, account, sync, or background app status.",
    textColor: colors.status.system,
  },
  orange_important_health: {
    accentColor: colors.accent.coral,
    backgroundColor: colors.accent.peach,
    borderColor: "#FFC9A8",
    meaning: "Important health information that should be reviewed soon.",
    textColor: colors.accent.coral,
  },
  purple_ai_suggestion: {
    accentColor: colors.status.ai,
    backgroundColor: colors.status.aiSoft,
    borderColor: "#D8CCFF",
    meaning:
      "AI-generated suggestion or summary that should stay clearly labeled.",
    textColor: colors.status.ai,
  },
  red_emergency: {
    accentColor: colors.status.emergency,
    backgroundColor: colors.status.emergencySoft,
    borderColor: "#FDA4AF",
    meaning: "Emergency or time-critical safety issue.",
    textColor: colors.status.emergency,
  },
  yellow_attention: {
    accentColor: colors.status.warning,
    backgroundColor: colors.status.warningSoft,
    borderColor: "#F6D96B",
    meaning: "Attention needed, but not urgent or emergency-level.",
    textColor: colors.status.warning,
  },
};

export function getNotificationColorToken(type: NotificationType) {
  return notificationColorTokens[type];
}
