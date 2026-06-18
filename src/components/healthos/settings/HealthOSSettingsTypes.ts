export type HealthOSPermissionKey =
  | "camera"
  | "photos"
  | "notifications"
  | "calendar"
  | "healthIntegrations"
  | "location"
  | "microphone";

export type HealthOSPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "limited"
  | "unavailable"
  | "unknown";

export type HealthOSSubscriptionPlatform =
  | "apple"
  | "googlePlay"
  | "web"
  | "stripe"
  | "none"
  | "unknown";

export type HealthOSSharingScope =
  | "private"
  | "family"
  | "caregiver"
  | "selected"
  | "unknown";

export type HealthOSAppearanceMode = "system" | "light" | "dark";

export type HealthOSSettingsRowData = {
  actionLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  id: string;
  route?: string;
  status?: string;
  subtitle?: string;
  title: string;
  value?: string;
};

export type HealthOSPermissionDisplay = {
  description: string;
  key: HealthOSPermissionKey;
  status: HealthOSPermissionStatus;
  title: string;
};

export type HealthOSProfileSettingsData = {
  appVersion: string;
  appearancePreferences: HealthOSSettingsRowData[];
  authUser: { email?: string | null; phone?: string | null } | null;
  connectedDevices: HealthOSSettingsRowData[];
  dataRecordsSummary: HealthOSSettingsRowData[];
  devicePermissions: HealthOSPermissionDisplay[];
  emptyState: string | null;
  error: string | null;
  familyCaregiverSummary: HealthOSSettingsRowData[];
  helpLegalLinks: HealthOSSettingsRowData[];
  loading: boolean;
  notificationPreferences: HealthOSSettingsRowData[];
  personalInfo: HealthOSSettingsRowData[];
  privacySharing: HealthOSSettingsRowData[];
  profile: {
    avatarUrl?: string | null;
    displayName?: string | null;
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
  } | null;
  profilePhoto: { previewUri?: string | null; storageStatus: string };
  securitySummary: HealthOSSettingsRowData[];
  subscriptionBilling: HealthOSSettingsRowData[];
};
