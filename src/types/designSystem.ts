import type { AppIconName } from "@/constants/appIcons";

export type RealmKey =
  | "nutrition"
  | "workout"
  | "biometrics"
  | "device_sync"
  | "medication"
  | "supplements"
  | "records"
  | "calendar"
  | "womens_health"
  | "pregnancy"
  | "baby_child"
  | "mens_health"
  | "family"
  | "ai_assistant";

export type PrivacyBadgeType =
  | "private"
  | "shared_partner"
  | "shared_family"
  | "shared_caregiver"
  | "emergency_only"
  | "locked";

export type WidgetSize = "small" | "medium" | "large";

export type CalendarIndicatorType =
  | "dot"
  | "halo"
  | "double_halo"
  | "stacked"
  | "icon";

export interface RealmCardConfig {
  key: RealmKey;
  title: string;
  description: string;
  icon: AppIconName;
  route: string;
  colorToken: string;
  isSensitive: boolean;
  requiresPermission?: string;
}

export interface HealthWidgetDisplayConfig {
  widgetKey: string;
  title: string;
  icon: AppIconName;
  realm: RealmKey;
  size: WidgetSize;
  colorToken: string;
  privacyBadge?: PrivacyBadgeType;
  route: string;
}

export interface CalendarVisualIndicator {
  id: string;
  type: CalendarIndicatorType;
  color: string;
  icon?: AppIconName;
  profileId?: string;
  avatarUrl?: string;
  label: string;
  priority: number;
}
