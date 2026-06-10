import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/context/AuthContext";
import { GeneralHealthActivityProvider } from "@/components/health/GeneralHealthActivityProvider";
import { ProfileSettingsProvider } from "@/lib/profile-settings-context";
import { AppThemeProvider } from "@/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileSettingsProvider>
          <AppThemeProvider>
            <GeneralHealthActivityProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="ai/index" />
              <Stack.Screen name="ai/review/[jobId]" />
              <Stack.Screen name="auth/index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/sign-in" />
              <Stack.Screen name="auth/sign-up" />
              <Stack.Screen name="auth/signup" />
              <Stack.Screen name="baby-child/index" />
              <Stack.Screen name="caregiver/index" />
              <Stack.Screen name="caregiver/[caregiverId]" />
              <Stack.Screen name="caregiver/join/[token]" />
              <Stack.Screen name="child/index" />
              <Stack.Screen name="child/[childId]" />
              <Stack.Screen name="circle/member/[memberId]" />
              <Stack.Screen name="cycle/index" />
              <Stack.Screen name="dev/ui-kit" />
              <Stack.Screen name="elder/index" />
              <Stack.Screen name="elder/[elderId]" />
              <Stack.Screen name="biometrics/index" />
              <Stack.Screen name="device-sync/index" />
              <Stack.Screen name="fitness/index" />
              <Stack.Screen name="fitness/exercise/[exerciseId]" />
              <Stack.Screen name="health-calendar/index" />
              <Stack.Screen name="health/[realm]" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/history" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/notes" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/heart-rate" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/blood-pressure" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/temperature" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/oxygen-saturation" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="health/general/weight" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="food/index" />
              <Stack.Screen name="food/barcode-scanner" />
              <Stack.Screen name="food/barcode-product" />
              <Stack.Screen name="food/smart-log" />
              <Stack.Screen name="food/details" />
              <Stack.Screen name="food/custom-food" />
              <Stack.Screen name="food/saved-meal" />
              <Stack.Screen name="food/recipe" />
              <Stack.Screen name="food/library-item" />
              <Stack.Screen name="medication/index" />
              <Stack.Screen name="medication/add" />
              <Stack.Screen name="medication/[medicationId]" />
              <Stack.Screen name="mens-health/index" />
              <Stack.Screen name="pregnancy/index" />
              <Stack.Screen name="records/index" />
              <Stack.Screen name="supplements/index" />
              <Stack.Screen name="supplements/add" />
              <Stack.Screen name="supplements/[supplementId]" />
              <Stack.Screen name="trusted-content/index" />
              <Stack.Screen name="join/[token]" />
              <Stack.Screen name="onboarding/index" />
              <Stack.Screen name="onboarding/profile" />
              <Stack.Screen name="onboarding/modules" />
              <Stack.Screen name="onboarding/theme" />
              <Stack.Screen name="onboarding/units" />
              <Stack.Screen name="reminders/[reminderId]" />
              <Stack.Screen name="scan-invite" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="settings/privacy-center" />
              </Stack>
            </GeneralHealthActivityProvider>
          </AppThemeProvider>
        </ProfileSettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
