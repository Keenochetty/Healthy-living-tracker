import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { OnboardingChoiceCard } from "@/components/onboarding/OnboardingChoiceCard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { AppButton } from "@/components/ui";
import { APP_MODULES, CORE_MODULE_KEYS } from "@/constants/modules";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/userPreferences";
import type { AppModuleKey } from "@/types/app";
import { typography } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function OnboardingModulesScreen() {
  const { theme } = useAppTheme();
  const [enabledModules, setEnabledModules] =
    useState<AppModuleKey[]>(CORE_MODULE_KEYS);

  useEffect(() => {
    getUserPreferences().then((preferences) =>
      setEnabledModules(preferences.enabledModules),
    );
  }, []);

  function toggleModule(moduleKey: AppModuleKey) {
    if (CORE_MODULE_KEYS.includes(moduleKey)) {
      return;
    }

    setEnabledModules((current) =>
      current.includes(moduleKey)
        ? current.filter((key) => key !== moduleKey)
        : [...current, moduleKey],
    );
  }

  async function continueToTheme() {
    await updateUserPreferences({ enabledModules });
    router.push("/onboarding/theme" as Href);
  }

  return (
    <ScreenWrapper>
      <OnboardingProgress step={3} totalSteps={5} />

      <View style={{ gap: 5 }}>
        <Text style={[typography.screenTitle, { color: theme.text }]}>
          Choose what you need now
        </Text>
        <Text style={[typography.body, { color: theme.mutedText }]}>
          Core tools stay on. Add more only when they fit your life.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {APP_MODULES.map((module) => {
          const isCore = CORE_MODULE_KEYS.includes(module.key);

          return (
            <OnboardingChoiceCard
              key={module.key}
              description={`${module.description}${isCore ? " Core module." : ""}`}
              disabled={isCore}
              emoji={module.emoji}
              onPress={() => toggleModule(module.key)}
              selected={enabledModules.includes(module.key)}
              title={module.name}
            />
          );
        })}
      </View>

      <AppButton fullWidth title="Continue" onPress={continueToTheme} />
    </ScreenWrapper>
  );
}
