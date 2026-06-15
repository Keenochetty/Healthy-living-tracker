import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { UnitPreviewCard } from "@/components/onboarding/UnitPreviewCard";
import { AppButton, AppChip } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { getUserPreferences } from "@/lib/userPreferences";
import type { UnitPreferences } from "@/types/profile";
import { typography } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

type UnitOption<T extends keyof UnitPreferences> = {
  key: T;
  label: string;
  options: UnitPreferences[T][];
};

const UNIT_OPTIONS: Array<UnitOption<keyof UnitPreferences>> = [
  { key: "weightUnit", label: "Weight", options: ["kg", "lb"] },
  { key: "heightUnit", label: "Height", options: ["cm", "in"] },
  { key: "liquidUnit", label: "Liquid", options: ["ml", "oz"] },
  {
    key: "temperatureUnit",
    label: "Temperature",
    options: ["celsius", "fahrenheit"],
  },
  { key: "distanceUnit", label: "Distance", options: ["km", "miles"] },
  { key: "speedUnit", label: "Speed", options: ["kmh", "mph"] },
  {
    key: "dateFormat",
    label: "Date format",
    options: ["dd/mm/yyyy", "mm/dd/yyyy", "yyyy/mm/dd"],
  },
];

export default function OnboardingUnitsScreen() {
  const { theme } = useAppTheme();
  const { savePreferences } = useAuth();
  const [message, setMessage] = useState("");
  const [units, setUnits] = useState<UnitPreferences | null>(null);

  useEffect(() => {
    getUserPreferences().then((preferences) => setUnits(preferences.units));
  }, []);

  function updateUnit<T extends keyof UnitPreferences>(
    key: T,
    value: UnitPreferences[T],
  ) {
    setUnits((current) => (current ? { ...current, [key]: value } : current));
  }

  async function finishSetup() {
    if (!units) {
      return;
    }

    const currentPreferences = await getUserPreferences();
    const result = await savePreferences({
      ...currentPreferences,
      onboardingComplete: true,
      units,
    });

    if (result.error) {
      setMessage(result.error);
    }

    router.replace("/(tabs)/today" as Href);
  }

  if (!units) {
    return null;
  }

  return (
    <ScreenWrapper>
      <OnboardingProgress step={5} totalSteps={5} />

      <View style={{ gap: 5 }}>
        <Text style={[typography.screenTitle, { color: theme.text }]}>
          Review your units
        </Text>
        <Text style={[typography.body, { color: theme.mutedText }]}>
          These are auto-selected from your country. Adjust anything that feels
          wrong.
        </Text>
      </View>

      <UnitPreviewCard units={units} />

      {message ? (
        <Text style={[typography.helper, { color: theme.danger }]}>
          {message}
        </Text>
      ) : null}

      <View style={{ gap: 12 }}>
        {UNIT_OPTIONS.map((option) => (
          <View key={option.key} style={{ gap: 8 }}>
            <Text style={[typography.cardTitle, { color: theme.text }]}>
              {option.label}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {option.options.map((value) => (
                <AppChip
                  key={value}
                  label={value}
                  onPress={() => updateUnit(option.key, value)}
                  selected={units[option.key] === value}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      <AppButton fullWidth title="Finish setup" onPress={finishSetup} />
    </ScreenWrapper>
  );
}
