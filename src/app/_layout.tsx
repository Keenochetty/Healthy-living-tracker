import "react-native-gesture-handler";
import "@/global.css";

import { HeroUINativeProvider } from "heroui-native/provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/context/AuthContext";
import { ActiveProfileProvider } from "@/context/ActiveProfileContext";
import { GeneralHealthActivityProvider } from "@/components/health/GeneralHealthActivityProvider";
import { AppLockGate } from "@/components/security";
import { ProfileSettingsProvider } from "@/lib/profile-settings-context";
import { AppThemeProvider } from "@/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <ActiveProfileProvider>
              <ProfileSettingsProvider>
                <AppThemeProvider>
                  <GeneralHealthActivityProvider>
                    <AppLockGate>
                      <StatusBar style="dark" />
                      <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="ai/index" />
                    <Stack.Screen name="ai/review/[jobId]" />
                    <Stack.Screen name="auth/index" />
                    <Stack.Screen name="auth/forgot-password" />
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
                    <Stack.Screen name="dev/ui-foundation" />
                    <Stack.Screen name="dev/ui-kit" />
                    <Stack.Screen name="elder/index" />
                    <Stack.Screen name="elder/[elderId]" />
                    <Stack.Screen name="biometrics/index" />
                    <Stack.Screen name="device-sync/index" />
                    <Stack.Screen name="fitness/library" />
                    <Stack.Screen name="fitness/history" />
                    <Stack.Screen name="fitness/programs" />
                    <Stack.Screen name="fitness/program/[programId]" />
                    <Stack.Screen name="fitness/program/[programId]/activate" />
                    <Stack.Screen name="fitness/goals" />
                    <Stack.Screen name="fitness/goal/[goalId]" />
                    <Stack.Screen name="fitness/exercise/[exerciseId]" />
                    <Stack.Screen name="fitness/ai-import" />
                    <Stack.Screen name="fitness/ai-import/preview" />
                    <Stack.Screen name="fitness/imported-plans" />
                    <Stack.Screen name="fitness/imported-plan/[importedPlanId]" />
                    <Stack.Screen name="fitness/preferences" />
                    <Stack.Screen name="health-calendar/index" />
                    <Stack.Screen
                      name="health/[realm]"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/history"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/notes"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/heart-rate"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/blood-pressure"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/temperature"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/oxygen-saturation"
                      options={{ animation: "slide_from_right" }}
                    />
                    <Stack.Screen
                      name="health/general/weight"
                      options={{ animation: "slide_from_right" }}
                    />
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
                    <Stack.Screen name="profile/[profileId]" />
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
                    <Stack.Screen name="settings/device-permissions" />
                    <Stack.Screen name="settings/medical-aid" />
                    <Stack.Screen name="settings/privacy-center" />
                    <Stack.Screen name="settings/profile-contact" />
                    <Stack.Screen name="settings/security" />
                    <Stack.Screen name="settings/subscription" />
                    <Stack.Screen name="settings/index" />
                    <Stack.Screen name="settings/coming-later" />
                      </Stack>
                    </AppLockGate>
                  </GeneralHealthActivityProvider>
                </AppThemeProvider>
              </ProfileSettingsProvider>
            </ActiveProfileProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
