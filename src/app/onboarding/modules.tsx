import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { OnboardingChoiceCard } from "@/components/onboarding/OnboardingChoiceCard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { APP_MODULES, CORE_MODULE_KEYS } from "@/constants/modules";
import { getUserPreferences, updateUserPreferences } from "@/lib/userPreferences";
import type { AppModuleKey } from "@/types/app";

export default function OnboardingModulesScreen() {
  const [enabledModules, setEnabledModules] = useState<AppModuleKey[]>(CORE_MODULE_KEYS);

  useEffect(() => {
    getUserPreferences().then((preferences) =>
      setEnabledModules(preferences.enabledModules)
    );
  }, []);

  function toggleModule(moduleKey: AppModuleKey) {
    if (CORE_MODULE_KEYS.includes(moduleKey)) {
      return;
    }

    setEnabledModules((current) =>
      current.includes(moduleKey)
        ? current.filter((key) => key !== moduleKey)
        : [...current, moduleKey]
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
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Choose what you need now
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
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

      <PrimaryButton label="Continue" onPress={continueToTheme} />
    </ScreenWrapper>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#7c3aed",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 54
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
