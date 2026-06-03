import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { OnboardingChoiceCard } from "@/components/onboarding/OnboardingChoiceCard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { UnitPreviewCard } from "@/components/onboarding/UnitPreviewCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppFormInput } from "@/components/ui";
import { COUNTRY_OPTIONS, getCountryByName } from "@/constants/countries";
import { getUserPreferences, updateUserPreferences } from "@/lib/userPreferences";
import type { UserPreferences } from "@/types/profile";

export default function OnboardingProfileScreen() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const selectedCountry = getCountryByName(preferences?.country ?? "South Africa");

  useEffect(() => {
    getUserPreferences().then(setPreferences);
  }, []);

  async function selectCountry(countryName: string) {
    if (!preferences) {
      return;
    }

    const country = getCountryByName(countryName);
    const nextPreferences = await updateUserPreferences({
      country: country.country,
      currency: country.currency,
      timezone: country.timezone,
      units: country.defaultUnits
    });

    setPreferences(nextPreferences);
  }

  async function continueToModules() {
    if (!preferences) {
      return;
    }

    await updateUserPreferences({ displayName: preferences.displayName.trim() });
    router.push("/onboarding/modules" as Href);
  }

  if (!preferences) {
    return null;
  }

  return (
    <ScreenWrapper>
      <OnboardingProgress step={2} totalSteps={5} />

      <View style={{ gap: 5 }}>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Set up your profile
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Add a name and pick the country settings that fit you.
        </Text>
      </View>

      <AppFormInput
        label="Display name"
        onChangeText={(displayName) =>
          setPreferences((current) => (current ? { ...current, displayName } : current))
        }
        placeholder="Your name"
        value={preferences.displayName}
      />

      <View style={{ gap: 10 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Country and region
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            Default region: {selectedCountry.country} / {selectedCountry.currency} /{" "}
            {selectedCountry.timezone}
          </Text>
        </View>

        {COUNTRY_OPTIONS.map((country) => (
          <OnboardingChoiceCard
            key={country.code}
            description={`${country.currency} / ${country.timezone}`}
            emoji={country.code}
            onPress={() => selectCountry(country.country)}
            selected={preferences.country === country.country}
            title={country.country}
          />
        ))}
      </View>

      <UnitPreviewCard units={preferences.units} />

      <PrimaryButton label="Continue" onPress={continueToModules} />
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
