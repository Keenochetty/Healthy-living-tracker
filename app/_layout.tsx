import { Stack } from "expo-router";
import "../global.css";

import { ProfileProvider } from "@/lib/profile-context";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="auth/onboarding" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="circles/index" />
        <Stack.Screen name="circles/create" />
        <Stack.Screen name="circles/[circleId]" />
        <Stack.Screen name="care-profiles/create" />
        <Stack.Screen name="care-profiles/[careProfileId]" />
        <Stack.Screen name="invites/create" />
        <Stack.Screen name="invites/[inviteId]" />
        <Stack.Screen name="calendar/create" />
        <Stack.Screen name="calendar/[eventId]" />
        <Stack.Screen name="profile/[profileId]" />
        <Stack.Screen name="child/[childId]" />
        <Stack.Screen name="caregiver/profile" />
        <Stack.Screen name="caregiver/edit-profile" />
        <Stack.Screen name="caregiver/assign" />
        <Stack.Screen name="caregiver/work-mode" />
        <Stack.Screen name="caregiver/child/[childId]" />
        <Stack.Screen name="health/conditions" />
        <Stack.Screen name="health/documents" />
        <Stack.Screen name="health/medication" />
        <Stack.Screen name="health/records" />
        <Stack.Screen name="privacy/permissions" />
        <Stack.Screen name="privacy/sharing" />
        <Stack.Screen name="assistant/index" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/account" />
        <Stack.Screen name="settings/ai-assistant" />
        <Stack.Screen name="settings/appearance" />
        <Stack.Screen name="settings/about" />
        <Stack.Screen name="settings/calendar-sync" />
        <Stack.Screen name="settings/caregiver-access" />
        <Stack.Screen name="settings/audit-history" />
        <Stack.Screen name="settings/emergency-contacts" />
        <Stack.Screen name="settings/family" />
        <Stack.Screen name="settings/help" />
        <Stack.Screen name="settings/language-region" />
        <Stack.Screen name="settings/measurement-units" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/privacy" />
        <Stack.Screen name="settings/privacy-sharing" />
        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/security" />
        <Stack.Screen name="settings/units" />
        <Stack.Screen name="settings/voice-assistant" />
      </Stack>
    </ProfileProvider>
  );
}
