import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ThemeOptionCard } from "@/components/onboarding/ThemeOptionCard";
import { USER_THEMES, getUserTheme } from "@/constants/themes";
import { getUserPreferences, updateUserPreferences } from "@/lib/userPreferences";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { UserThemeKey } from "@/types/profile";

export default function OnboardingThemeScreen() {
  const { setThemeKey: saveProviderThemeKey } = useAppTheme();
  const [themeKey, setThemeKey] = useState<UserThemeKey>("soft_lavender");
  const theme = getUserTheme(themeKey);

  useEffect(() => {
    getUserPreferences().then((preferences) => setThemeKey(preferences.themeKey));
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
      <OnboardingProgress primaryColor={theme.primary} step={4} totalSteps={5} />

      <View style={{ gap: 5 }}>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Choose a theme
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
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

      <PrimaryButton color={theme.primary} label="Continue" onPress={continueToUnits} />
    </ScreenWrapper>
  );
}

function PrimaryButton({
  color,
  label,
  onPress
}: {
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 54
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
