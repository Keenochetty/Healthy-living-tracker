import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { UnitPreviewCard } from "@/components/onboarding/UnitPreviewCard";
import { useAuth } from "@/context/AuthContext";
import { getUserPreferences } from "@/lib/userPreferences";
import type { UnitPreferences } from "@/types/profile";

type UnitOption<T extends keyof UnitPreferences> = {
  key: T;
  label: string;
  options: UnitPreferences[T][];
};

const UNIT_OPTIONS: Array<UnitOption<keyof UnitPreferences>> = [
  { key: "weightUnit", label: "Weight", options: ["kg", "lb"] },
  { key: "heightUnit", label: "Height", options: ["cm", "in"] },
  { key: "liquidUnit", label: "Liquid", options: ["ml", "oz"] },
  { key: "temperatureUnit", label: "Temperature", options: ["celsius", "fahrenheit"] },
  { key: "distanceUnit", label: "Distance", options: ["km", "miles"] },
  { key: "speedUnit", label: "Speed", options: ["kmh", "mph"] },
  {
    key: "dateFormat",
    label: "Date format",
    options: ["dd/mm/yyyy", "mm/dd/yyyy", "yyyy/mm/dd"]
  }
];

export default function OnboardingUnitsScreen() {
  const { savePreferences } = useAuth();
  const [message, setMessage] = useState("");
  const [units, setUnits] = useState<UnitPreferences | null>(null);

  useEffect(() => {
    getUserPreferences().then((preferences) => setUnits(preferences.units));
  }, []);

  function updateUnit<T extends keyof UnitPreferences>(key: T, value: UnitPreferences[T]) {
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
      units
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
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Review your units
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          These are auto-selected from your country. Adjust anything that feels wrong.
        </Text>
      </View>

      <UnitPreviewCard units={units} />

      {message ? <Text style={{ color: "#92400e", lineHeight: 20 }}>{message}</Text> : null}

      <View style={{ gap: 12 }}>
        {UNIT_OPTIONS.map((option) => (
          <View key={option.key} style={{ gap: 8 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{option.label}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {option.options.map((value) => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  key={value}
                  onPress={() => updateUnit(option.key, value)}
                  style={{
                    backgroundColor: units[option.key] === value ? "#7c3aed" : "#ffffff",
                    borderColor: units[option.key] === value ? "#7c3aed" : "#f1f5f9",
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 10
                  }}
                >
                  <Text
                    style={{
                      color: units[option.key] === value ? "#ffffff" : "#475569",
                      fontWeight: "900"
                    }}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton label="Finish setup" onPress={finishSetup} />
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
