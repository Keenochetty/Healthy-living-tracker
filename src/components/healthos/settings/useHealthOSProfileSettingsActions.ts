import { Alert, Linking } from "react-native";
import { Href, router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { openDeviceSettings } from "@/lib/devicePermissions";

export function useHealthOSProfileSettingsActions() {
  const auth = useAuth();

  function go(route?: string) {
    if (!route) return;
    router.push(route as Href);
  }

  return {
    changePassword: () => go("/auth/forgot-password"),
    chooseProfilePhoto: () =>
      Alert.alert("Profile photo", "Gallery selection is a preview foundation until safe upload storage is connected."),
    clearCache: () =>
      Alert.alert("Clear local cache", "No safe cache clear flow is connected from this control panel yet."),
    contactSupport: () =>
      Alert.alert("Support", "A support route is not configured yet."),
    deleteAccountRequest: () =>
      Alert.alert(
        "Account deletion",
        "Account deletion request flow is not connected from this screen. Use a verified backend flow before deleting data.",
      ),
    editProfile: () => go("/settings/profile-contact"),
    exportData: () => go("/settings/privacy-center"),
    manageCaregiverAccess: () => go("/(tabs)/circle"),
    manageConnectedDevice: () => go("/device-sync"),
    manageFamilySharing: () => go("/(tabs)/circle"),
    managePrivacy: () => go("/settings/privacy-center"),
    manageSubscription: () => go("/settings/subscription"),
    openDeviceSettings: () => void openDeviceSettings().catch(() => Linking.openSettings()),
    openHelp: () => Alert.alert("Help", "Help center route is not configured yet."),
    openLegal: (route?: string) => go(route ?? "/settings/privacy-center"),
    openProfilePhotoActions: () => undefined,
    openRecords: () => go("/records"),
    openTwoStepVerification: () => go("/settings/security"),
    removeProfilePhoto: () =>
      Alert.alert("Remove profile photo", "Photo removal is deferred until profile photo storage is connected."),
    requestPermission: () => go("/settings/device-permissions"),
    restorePurchases: () => go("/settings/subscription"),
    signOut: async () => {
      await auth.signOut();
      router.replace("/auth" as Href);
    },
    takeProfilePhoto: () =>
      Alert.alert("Profile photo", "Camera capture is a preview foundation until safe upload storage is connected."),
    updateAppearancePreference: () => go("/onboarding/theme"),
    updateNotificationPreference: () => go("/reminders"),
  };
}
