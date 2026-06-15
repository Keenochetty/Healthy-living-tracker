export type SettingsStatus =
  | "Verified"
  | "Needs attention"
  | "Off"
  | "On"
  | "Not connected"
  | "Permission denied"
  | "Manage in system settings"
  | "Coming later";

export type SettingsControlPanelItem = {
  action?: "signOut";
  description: string;
  keywords?: string[];
  route?: string;
  status?: SettingsStatus;
  title: string;
};

export type SettingsControlPanelGroup = {
  future?: boolean;
  items: SettingsControlPanelItem[];
  key: string;
  title: string;
};

export const SETTINGS_CONTROL_PANEL_GROUPS: SettingsControlPanelGroup[] = [
  {
    key: "account",
    title: "Account",
    items: [
      {
        description: "Name, profile photo, date of birth, and contact details.",
        route: "/settings/profile-contact",
        status: "Verified",
        title: "Profile details",
      },
      {
        description: "Email used by the authenticated account.",
        route: "/settings/profile-contact",
        title: "Email",
      },
      {
        description: "Add or update a contact phone number.",
        keywords: ["mobile"],
        route: "/settings/profile-contact",
        title: "Phone number",
      },
      {
        description: "Change the password for the signed-in account.",
        keywords: ["login", "security"],
        route: "/settings/security",
        title: "Password",
      },
      {
        description: "Add or update the profile avatar.",
        keywords: ["avatar", "photo"],
        route: "/settings/profile-contact",
        title: "Profile photo",
      },
      {
        description:
          "Manage emergency contact details, visibility, and Medical ID inclusion.",
        keywords: ["emergency"],
        route: "/settings/profile-contact",
        title: "Emergency contacts",
      },
      {
        description: "Review connected authentication providers.",
        keywords: ["google", "apple", "login"],
        status: "Coming later",
        title: "Linked sign-in methods",
      },
      {
        action: "signOut",
        description: "Sign out of the authenticated account.",
        keywords: ["logout"],
        title: "Sign out",
      },
    ],
  },
  {
    key: "security",
    title: "Security",
    items: [
      {
        description: "Update account password after re-authentication.",
        route: "/settings/security",
        title: "Change password",
      },
      {
        description: "Add a TOTP authenticator factor.",
        keywords: ["mfa", "totp", "2fa"],
        route: "/settings/security",
        title: "Two-step verification",
      },
      {
        description: "Protect the app with device authentication.",
        keywords: ["face id", "fingerprint", "lock"],
        route: "/settings/security",
        title: "Biometrics and app lock",
      },
      {
        description: "Review current session details.",
        keywords: ["devices"],
        route: "/settings/security",
        title: "Trusted devices and active sessions",
      },
      {
        description: "Review local security activity and status.",
        route: "/settings/security",
        title: "Security alerts",
      },
      {
        description: "Prepare account recovery options.",
        status: "Coming later",
        title: "Recovery options",
      },
    ],
  },
  {
    key: "privacy",
    title: "Privacy and family sharing",
    items: [
      {
        description: "Review Circle members and visible profiles.",
        route: "/(tabs)/circle",
        title: "Family/Circle visibility",
      },
      {
        description: "Control which members can view or manage information.",
        route: "/(tabs)/circle",
        title: "Member permissions",
      },
      {
        description: "Review assigned caregiver access.",
        route: "/(tabs)/circle",
        title: "Caregiver permissions",
      },
      {
        description: "Manage consent and data-sharing choices.",
        route: "/settings/privacy-center",
        title: "Data sharing",
      },
      {
        description: "Review sensitive health-area privacy.",
        route: "/settings/privacy-center",
        title: "Hidden and sensitive health areas",
      },
      {
        description: "Review privacy and consent activity.",
        route: "/settings/privacy-center",
        title: "Privacy activity log",
      },
    ],
  },
  {
    key: "notifications",
    title: "Notifications",
    items: [
      {
        description: "Medication reminder preferences.",
        route: "/settings/notifications",
        status: "On",
        title: "Medication reminders",
      },
      {
        description: "Appointment reminder preferences.",
        route: "/settings/notifications",
        status: "On",
        title: "Appointment reminders",
      },
      {
        description: "Circle and family update preferences.",
        route: "/settings/notifications",
        title: "Family/Circle updates",
      },
      {
        description: "Scanner-result notification preferences.",
        route: "/settings/notifications",
        title: "Scanner results",
      },
      {
        description: "Important health alert preferences.",
        route: "/settings/notifications",
        status: "Needs attention",
        title: "Critical health alerts",
      },
      {
        description: "Configure quiet-hour behavior.",
        route: "/settings/notifications",
        title: "Quiet hours",
      },
      {
        description: "Review the current push-notification permission.",
        keywords: ["permission"],
        route: "/settings/notifications",
        status: "Manage in system settings",
        title: "Push notification permission status",
      },
    ],
  },
  {
    key: "permissions",
    title: "Device permissions",
    items: [
      {
        description:
          "Review actual camera permission and contextual scanner access.",
        route: "/settings/device-permissions",
        title: "Camera",
      },
      {
        description: "Review photo-library access, including limited access.",
        keywords: ["photos", "media"],
        route: "/settings/device-permissions",
        title: "Photo and media library",
      },
      {
        description:
          "Compare device permission with the app notification preference.",
        route: "/settings/device-permissions",
        title: "Notifications",
      },
      {
        description: "Confirm that location is not currently requested.",
        route: "/settings/device-permissions",
        title: "Location",
      },
      {
        description:
          "Review the current native health-integration availability.",
        keywords: ["healthkit", "health connect"],
        route: "/settings/device-permissions",
        title: "Health data integrations",
      },
      {
        description:
          "Confirm that microphone access is not currently requested.",
        keywords: ["voice"],
        route: "/settings/device-permissions",
        title: "Microphone",
      },
    ],
  },
  {
    key: "preferences",
    title: "Appearance and preferences",
    items: [
      {
        description: "Choose the app theme and display style.",
        keywords: ["light", "dark", "system"],
        route: "/onboarding/theme",
        title: "Light, dark, and system mode",
      },
      {
        description: "Choose measurement units.",
        keywords: ["metric", "imperial"],
        route: "/onboarding/units",
        title: "Units",
      },
      {
        description: "Review language and regional setup.",
        route: "/onboarding/profile",
        title: "Language and region",
      },
      {
        description: "Choose date and time display preferences.",
        route: "/onboarding/units",
        title: "Date and time format",
      },
      {
        description: "Configure accessible display and interaction options.",
        status: "Coming later",
        title: "Accessibility preferences",
      },
    ],
  },
  {
    key: "subscription",
    title: "Subscription and billing",
    items: [
      {
        description: "Review the backend-verified app plan.",
        route: "/settings/subscription",
        title: "Current plan",
      },
      {
        description: "Review renewal and trial dates when available.",
        route: "/settings/subscription",
        title: "Renewal or trial status",
      },
      {
        description: "Open the platform subscription-management flow.",
        route: "/settings/subscription",
        title: "Manage subscription",
      },
      {
        description: "Review native purchase restoration availability.",
        route: "/settings/subscription",
        title: "Restore purchases",
      },
      {
        description: "Open platform billing support.",
        route: "/settings/subscription",
        title: "Billing support",
      },
    ],
  },
  {
    key: "data",
    title: "Data and account deletion",
    items: [
      {
        description: "Create an export request for your data.",
        route: "/settings/privacy-center",
        title: "Export my data",
      },
      {
        description: "Review and download permitted records.",
        route: "/records",
        title: "Download documents where allowed",
      },
      {
        description: "Initiate an account-deletion request.",
        keywords: ["remove account"],
        route: "/settings/privacy-center",
        status: "Needs attention",
        title: "Delete account",
      },
      {
        description: "Understand retention and deletion behavior.",
        route: "/settings/privacy-center",
        title: "Data retention explanation",
      },
      {
        description: "Review privacy policy, terms, and medical disclaimers.",
        route: "/settings/privacy-center",
        title: "Legal and privacy policy links",
      },
    ],
  },
  {
    future: true,
    key: "medical-aid",
    title: "Medical aid (planned)",
    items: [
      {
        description:
          "Review the reserved profile fields. No sensitive medical-aid data is collected yet.",
        keywords: ["insurance"],
        route: "/settings/medical-aid",
        status: "Coming later",
        title: "Medical aid profile",
      },
      {
        description: "Review the planned plan and option architecture.",
        keywords: ["insurance"],
        route: "/settings/medical-aid",
        status: "Coming later",
        title: "Plan and option",
      },
      {
        description: "Review planned verified-data coverage lookup filters.",
        route: "/settings/medical-aid",
        status: "Coming later",
        title: "Coverage directory",
      },
      {
        description:
          "Review future pharmacy coverage verification requirements.",
        route: "/settings/medical-aid",
        status: "Coming later",
        title: "Pharmacy coverage checker",
      },
      {
        description: "Review careful result language and source requirements.",
        route: "/settings/medical-aid",
        status: "Coming later",
        title: "Disclaimer and verification status",
      },
    ],
  },
];
