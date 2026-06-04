import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/context/AuthContext";
import { ProfileSettingsProvider } from "@/lib/profile-settings-context";
import { AppThemeProvider } from "@/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileSettingsProvider>
          <AppThemeProvider>
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
              <Stack.Screen name="supplements/index" />
              <Stack.Screen name="supplements/add" />
              <Stack.Screen name="supplements/[supplementId]" />
              <Stack.Screen name="join/[token]" />
              <Stack.Screen name="onboarding/index" />
              <Stack.Screen name="onboarding/profile" />
              <Stack.Screen name="onboarding/modules" />
              <Stack.Screen name="onboarding/theme" />
              <Stack.Screen name="onboarding/units" />
              <Stack.Screen name="reminders/[reminderId]" />
              <Stack.Screen name="scan-invite" />
            </Stack>
          </AppThemeProvider>
        </ProfileSettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
