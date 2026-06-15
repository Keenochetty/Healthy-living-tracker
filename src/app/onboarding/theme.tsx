import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ThemeOptionCard } from "@/components/onboarding/ThemeOptionCard";
import { AppButton } from "@/components/ui";
import { USER_THEMES, getUserTheme } from "@/constants/themes";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/userPreferences";
import { useAppTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/designSystem";
import type { UserThemeKey } from "@/types/profile";

export default function OnboardingThemeScreen() {
  const { setThemeKey: saveProviderThemeKey, theme: activeTheme } =
    useAppTheme();
  const [themeKey, setThemeKey] = useState<UserThemeKey>("soft_lavender");
  const theme = getUserTheme(themeKey);

  useEffect(() => {
    getUserPreferences().then((preferences) =>
      setThemeKey(preferences.themeKey),
    );
  }, []);

  async function continueToUnits() {
    await saveProviderThemeKey(themeKey);
    router.push("/onboarding/units" as Href);
  }

  function selectTheme(nextThemeKey: UserThemeKey) {
    setThemeKey(nextThemeKey);
    updateUserPreferences({ themeKey: nextThemeKey }).catch(() => undefined);
  }

  return (
    <ScreenWrapper>
      <OnboardingProgress
        primaryColor={theme.primary}
        step={4}
        totalSteps={5}
      />

      <View style={{ gap: 5 }}>
        <Text style={[typography.screenTitle, { color: activeTheme.text }]}>
          Choose a theme
        </Text>
        <Text style={[typography.body, { color: activeTheme.mutedText }]}>
          Pick a look that feels calm and useful. You can change it later.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {USER_THEMES.map((option) => (
          <ThemeOptionCard
            key={option.key}
            onPress={() => selectTheme(option.key)}
            selected={themeKey === option.key}
            theme={option}
          />
        ))}
      </View>

      <AppButton fullWidth title="Continue" onPress={continueToUnits} />
    </ScreenWrapper>
  );
}
