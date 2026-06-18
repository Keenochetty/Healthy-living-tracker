import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSAccountQuickActions } from "./HealthOSAccountQuickActions";
import { HealthOSAppearancePreferencesSection } from "./HealthOSAppearancePreferencesSection";
import { HealthOSConnectedDevicesSection } from "./HealthOSConnectedDevicesSection";
import { HealthOSDangerZoneSection } from "./HealthOSDangerZoneSection";
import { HealthOSDataRecordsSection } from "./HealthOSDataRecordsSection";
import { HealthOSDevicePermissionsSection } from "./HealthOSDevicePermissionsSection";
import { HealthOSFamilyCaregiverPermissionsSection } from "./HealthOSFamilyCaregiverPermissionsSection";
import { HealthOSHelpLegalSection } from "./HealthOSHelpLegalSection";
import { HealthOSNotificationSettingsSection } from "./HealthOSNotificationSettingsSection";
import { HealthOSPersonalInfoSection } from "./HealthOSPersonalInfoSection";
import { HealthOSPrivacySharingSection } from "./HealthOSPrivacySharingSection";
import { HealthOSProfileHeroCard } from "./HealthOSProfileHeroCard";
import { HealthOSProfilePhotoActionsSheet } from "./HealthOSProfilePhotoActionsSheet";
import { HealthOSSecuritySection } from "./HealthOSSecuritySection";
import { HealthOSSignOutSection } from "./HealthOSSignOutSection";
import { HealthOSSubscriptionBillingSection } from "./HealthOSSubscriptionBillingSection";
import { useHealthOSProfileSettingsActions } from "./useHealthOSProfileSettingsActions";
import { useHealthOSProfileSettingsData } from "./useHealthOSProfileSettingsData";

export function HealthOSProfileControlPanelScreen() {
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const data = useHealthOSProfileSettingsData();
  const actions = useHealthOSProfileSettingsActions();
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const displayName = data.profile?.displayName ?? data.profile?.fullName ?? data.profile?.email ?? "HealthOS";
  const initials = makeInitials(displayName);

  return (
    <HealthOSAppShell
      activeNavKey="home"
      aiPlaceholder="Ask about settings, privacy, or your account"
      avatarUri={data.profilePhoto.previewUri}
      initials={initials}
      showBottomNav={false}
      subtitle="Profile and account controls"
      title="Settings"
      withBottomNavSpace={false}
    >
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {data.loading ? (
            <HealthOSCard>
              <View style={styles.loading}>
                <ActivityIndicator color={palette.ai} />
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  Loading profile controls...
                </Text>
              </View>
            </HealthOSCard>
          ) : null}
          {data.error ? (
            <HealthOSCard title="Settings unavailable" variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {data.error}
              </Text>
            </HealthOSCard>
          ) : null}
          <HealthOSProfileHeroCard
            data={data}
            onEditProfile={actions.editProfile}
            onPhotoActions={() => setPhotoSheetVisible(true)}
          />
          <HealthOSAccountQuickActions
            onEditProfile={actions.editProfile}
            onFamily={actions.manageFamilySharing}
            onNotifications={actions.updateNotificationPreference}
            onPrivacy={actions.managePrivacy}
            onSecurity={actions.changePassword}
            onSubscription={actions.manageSubscription}
          />
          <HealthOSPersonalInfoSection data={data} onEditProfile={actions.editProfile} />
          <HealthOSSecuritySection data={data} onChangePassword={actions.changePassword} onTwoStep={actions.openTwoStepVerification} />
          <HealthOSDevicePermissionsSection data={data} onOpenSettings={actions.openDeviceSettings} onRequestPermission={actions.requestPermission} />
          <HealthOSNotificationSettingsSection data={data} onManage={actions.updateNotificationPreference} />
          <HealthOSPrivacySharingSection data={data} onManageFamily={actions.manageFamilySharing} onManagePrivacy={actions.managePrivacy} />
          <HealthOSFamilyCaregiverPermissionsSection data={data} onManage={actions.manageFamilySharing} />
          <HealthOSSubscriptionBillingSection data={data} onManage={actions.manageSubscription} onRestore={actions.restorePurchases} />
          <HealthOSConnectedDevicesSection data={data} onManage={actions.manageConnectedDevice} />
          <HealthOSAppearancePreferencesSection data={data} onManage={actions.updateAppearancePreference} />
          <HealthOSDataRecordsSection data={data} onClearCache={actions.clearCache} onExport={actions.exportData} onOpenRecords={actions.openRecords} />
          <HealthOSHelpLegalSection data={data} onContactSupport={actions.contactSupport} onHelp={actions.openHelp} onLegal={actions.openLegal} />
          <HealthOSSignOutSection onSignOut={actions.signOut} />
          <HealthOSDangerZoneSection onDeleteAccountRequest={actions.deleteAccountRequest} />
        </ScrollView>
      </View>
      <HealthOSProfilePhotoActionsSheet
        onChoosePhoto={actions.chooseProfilePhoto}
        onClose={() => setPhotoSheetVisible(false)}
        onRemovePhoto={actions.removeProfilePhoto}
        onTakePhoto={actions.takeProfilePhoto}
        visible={photoSheetVisible}
      />
    </HealthOSAppShell>
  );
}

function makeInitials(value: string) {
  return value
    .split(/\s|@/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "HS";
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.lg,
    paddingBottom: healthOSSpacing["3xl"],
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.lg,
  },
  loading: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  screen: {
    alignSelf: "center",
    flex: 1,
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
});
