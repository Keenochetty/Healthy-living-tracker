import Constants from "expo-constants";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { getDevicePermissionStates } from "@/lib/devicePermissions";
import {
  getActiveProfile,
  getFamilyCircleMembers,
  getFamilyCircles,
  getPendingInvites,
  getPermissionsForProfile,
} from "@/lib/familyPermissionsStorage";
import {
  getNotificationSettings,
  getReminderCategorySettings,
} from "@/services/reminders/notificationService";

import type {
  HealthOSPermissionDisplay,
  HealthOSPermissionStatus,
  HealthOSProfileSettingsData,
  HealthOSSettingsRowData,
} from "./HealthOSSettingsTypes";

const EMPTY_DATA: HealthOSProfileSettingsData = {
  appVersion: "Unknown",
  appearancePreferences: [],
  authUser: null,
  connectedDevices: [],
  dataRecordsSummary: [],
  devicePermissions: [],
  emptyState: null,
  error: null,
  familyCaregiverSummary: [],
  helpLegalLinks: [],
  loading: true,
  notificationPreferences: [],
  personalInfo: [],
  privacySharing: [],
  profile: null,
  profilePhoto: { storageStatus: "Profile photo upload is preview-only until storage upload is connected." },
  securitySummary: [],
  subscriptionBilling: [],
};

export function useHealthOSProfileSettingsData() {
  const auth = useAuth();
  const [data, setData] = useState<HealthOSProfileSettingsData>({
    ...EMPTY_DATA,
    authUser: auth.user ? { email: auth.user.email, phone: auth.user.phone } : null,
    profile: auth.profile,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setData((current) => ({ ...current, loading: true, error: null }));
      try {
        const [
          permissionStates,
          notificationSettings,
          categorySettings,
          activeProfile,
          circles,
          members,
          pendingInvites,
        ] = await Promise.all([
          getDevicePermissionStates().catch(() => []),
          getNotificationSettings().catch(() => null),
          getReminderCategorySettings().catch(() => []),
          getActiveProfile().catch(() => null),
          getFamilyCircles().catch(() => []),
          getFamilyCircleMembers().catch(() => []),
          getPendingInvites().catch(() => []),
        ]);
        const permissions = activeProfile
          ? await getPermissionsForProfile(activeProfile.id).catch(() => [])
          : [];
        const displayName =
          auth.profile?.displayName ??
          auth.profile?.fullName ??
          auth.preferences?.displayName ??
          activeProfile?.displayName ??
          null;
        const email = auth.profile?.email ?? auth.user?.email ?? null;

        if (!active) return;

        setData({
          appVersion: Constants.expoConfig?.version ?? "Unknown",
          appearancePreferences: [
            row("theme", "Theme", "Current theme preference", auth.preferences?.themeKey ?? "Not set", "/onboarding/theme"),
            row("units", "Units", "Measurement units", formatUnits(auth.preferences?.units), "/onboarding/units"),
            row("region", "Country / region", "Regional setup", auth.preferences?.country ?? "Not set", "/onboarding/profile"),
            row("motion", "Reduced motion", "Foundation only", "Not connected"),
            row("haptics", "Haptics", "Foundation only", "Not connected"),
          ],
          authUser: auth.user ? { email: auth.user.email, phone: auth.user.phone } : null,
          connectedDevices: [
            row("apple-health", "Apple Health", "Native integration foundation", "Not connected"),
            row("health-connect", "Google Health Connect", "Native integration foundation", "Not connected"),
            row("wearables", "Wearables", "Wearable integrations will appear when connected", "Not connected"),
            row("device-sync", "Device sync", "Open device sync foundation", "Manage", "/device-sync"),
          ],
          dataRecordsSummary: [
            row("export", "Export my data", "Request/export flow is routed to privacy center", "Foundation", "/settings/privacy-center"),
            row("records", "View records", "Open permitted records and documents", "Open", "/records"),
            row("ai-import-history", "AI import history", "Review AI import previews", "Open", "/ai"),
            row("cache", "Clear local cache", "No safe cache clear action connected here", "Deferred"),
          ],
          devicePermissions: permissionStates.map<HealthOSPermissionDisplay>((permission) => ({
            description: permissionDescription(permission.key),
            key: mapPermissionKey(permission.key),
            status: mapPermissionStatus(permission.status),
            title: permissionTitle(permission.key),
          })),
          emptyState: auth.profile || auth.user ? null : "No signed-in profile data found. Local preferences are still available.",
          error: null,
          familyCaregiverSummary: [
            row("circles", "Family circles", "Real local family circle count", String(circles.length || 0), "/(tabs)/circle"),
            row("members", "Family members", "Visible local member count", String(members.length || 0), "/(tabs)/circle"),
            row("pending", "Pending invites", "Pending local invite count", String(pendingInvites.length || 0), "/(tabs)/circle"),
            row("permissions", "Shared modules", "Permission records connected to active profile", String(permissions.length || 0), "/(tabs)/circle"),
          ],
          helpLegalLinks: [
            row("help", "Help center", "Help center route is not configured yet", "Deferred"),
            row("support", "Contact support", "Support contact route is not configured yet", "Deferred"),
            row("feedback", "Send feedback", "Feedback route is not configured yet", "Deferred"),
            row("terms", "Terms and conditions", "Legal route not separate; privacy center is the safe existing destination", "Open", "/settings/privacy-center"),
            row("privacy-policy", "Privacy policy", "Open existing privacy center route", "Open", "/settings/privacy-center"),
            row("medical-disclaimer", "Medical disclaimer", "Privacy center includes safety/legal copy", "Open", "/settings/privacy-center"),
          ],
          loading: false,
          notificationPreferences: [
            row("master", "Master notifications", "Device notifications preference", notificationSettings?.notificationsEnabled ? "On" : "Off", "/reminders"),
            row("permission", "Notification permission", "Current device permission", notificationSettings?.permissionStatus ?? "Unknown", "/reminders"),
            row("quiet-hours", "Quiet hours", "Quiet hour foundation", notificationSettings?.quietHoursEnabled ? "On" : "Off", "/reminders"),
            row("categories", "Reminder categories", "Configured category count", String(categorySettings.length), "/reminders"),
          ],
          personalInfo: [
            row("full-name", "Full name", "Account profile full name", auth.profile?.fullName ?? "Not set", "/settings/profile-contact"),
            row("display-name", "Display name", "Shown inside HealthOS", displayName ?? "Not set", "/settings/profile-contact"),
            row("email", "Email", "Authenticated account email", email ?? "Not set", "/settings/profile-contact"),
            row("phone", "Phone", "Account phone if available", auth.profile?.phone ?? auth.user?.phone ?? "Not set", "/settings/profile-contact"),
            row("dob", "Date of birth", "Only shown when collected", activeProfile?.dateOfBirth ?? "Not set"),
            row("gender", "Gender", "Only shown when collected", activeProfile?.gender ?? "Not set"),
            row("emergency", "Emergency contact", "Emergency contact shortcut foundation", "Manage", "/settings/profile-contact"),
            row("medical-aid", "Medical aid / insurance", "Foundation only", "Coming later", "/settings/medical-aid"),
          ],
          privacySharing: [
            row("visibility", "Profile visibility", "Private by default unless shared", "Private"),
            row("family", "Family sharing", "You choose what family or caregivers can see.", circles.length ? "Connected" : "Not connected", "/(tabs)/circle"),
            row("caregiver", "Caregiver access", "Manage caregiver access from family controls", "Manage", "/(tabs)/circle"),
            row("women", "Women's health privacy", "Sensitive by default", "Private", "/settings/privacy-center"),
            row("medication", "Medication sharing", "Sensitive by default", "Private", "/settings/privacy-center"),
            row("records", "Records sharing", "Sensitive by default", "Private", "/settings/privacy-center"),
            row("ai", "AI data use", "No private data is attached to AI by default", "Limited", "/ai"),
          ],
          profile: {
            avatarUrl: auth.profile?.avatarUrl,
            displayName,
            email,
            fullName: auth.profile?.fullName,
            phone: auth.profile?.phone ?? auth.user?.phone,
          },
          profilePhoto: {
            previewUri: auth.profile?.avatarUrl,
            storageStatus: auth.profile?.avatarUrl
              ? "Profile photo loaded from profile data."
              : "No profile photo. Upload storage is deferred unless an existing safe handler is connected.",
          },
          securitySummary: [
            row("password", "Change password", "Use existing password recovery route", "Available", "/auth/forgot-password"),
            row("2fa", "Two-step verification", "Foundation only unless backend MFA is connected", "Deferred", "/settings/security"),
            row("sessions", "Active sessions / devices", "Raw session tokens are never shown", auth.session ? "Signed in" : "Not signed in", "/settings/security"),
            row("methods", "Sign-in methods", "Email/password status based on current auth", email ? "Email" : "Not set", "/settings/security"),
            row("alerts", "Security alerts", "Local security status foundation", "Foundation", "/settings/security"),
          ],
          subscriptionBilling: [
            row("plan", "Current plan", "Billing provider not connected in this phase", "Unknown", "/settings/subscription"),
            row("renewal", "Renewal / trial status", "Only shown when billing provider exists", "Not connected", "/settings/subscription"),
            row("platform", "Billing platform", "Apple, Google Play, or Web when connected", "Unknown", "/settings/subscription"),
            row("manage", "Manage subscription", "Platform management foundation", "Open", "/settings/subscription"),
            row("restore", "Restore purchases", "Native purchase restore foundation", "Deferred", "/settings/subscription"),
          ],
        });
      } catch (error) {
        if (!active) return;
        setData((current) => ({
          ...current,
          error: error instanceof Error ? error.message : "Settings data could not be loaded.",
          loading: false,
        }));
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [auth.preferences, auth.profile, auth.session, auth.user]);

  return data;
}

function row(
  id: string,
  title: string,
  subtitle: string,
  value?: string,
  route?: string,
): HealthOSSettingsRowData {
  return { id, route, subtitle, title, value };
}

function mapPermissionStatus(status: string): HealthOSPermissionStatus {
  if (status === "allowed") return "granted";
  if (status === "not_requested") return "undetermined";
  if (status === "limited") return "limited";
  if (status === "denied") return "denied";
  if (status === "unavailable") return "unavailable";
  return "unknown";
}

function mapPermissionKey(key: string): HealthOSPermissionDisplay["key"] {
  if (key === "health_data") return "healthIntegrations";
  if (key === "camera" || key === "photos" || key === "notifications" || key === "location" || key === "microphone") return key;
  return "healthIntegrations";
}

function permissionTitle(key: string) {
  if (key === "health_data") return "Health integrations";
  if (key === "photos") return "Photos / media";
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function permissionDescription(key: string) {
  if (key === "camera") return "Used for scanner, documents, labels, and optional profile photo capture.";
  if (key === "photos") return "Used when you choose documents, images, or profile photos.";
  if (key === "notifications") return "Used for reminders and alerts you enable.";
  if (key === "health_data") return "Future Apple Health / Health Connect foundation.";
  if (key === "location") return "Not currently requested.";
  if (key === "microphone") return "Not currently requested.";
  return "Permission foundation.";
}

function formatUnits(units: unknown) {
  if (!units || typeof units !== "object") return "Not set";
  const values = units as { distanceUnit?: string; weightUnit?: string };
  return [values.weightUnit, values.distanceUnit].filter(Boolean).join(" / ") || "Configured";
}
