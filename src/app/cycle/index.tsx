import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { CycleCalendarCard } from "@/components/cycle/CycleCalendarCard";
import { CycleDisclaimerCard } from "@/components/cycle/CycleDisclaimerCard";
import { CycleLogCard } from "@/components/cycle/CycleLogCard";
import { CyclePredictionCard } from "@/components/cycle/CyclePredictionCard";
import { CyclePrivacyCard } from "@/components/cycle/CyclePrivacyCard";
import { CycleSettingsCard } from "@/components/cycle/CycleSettingsCard";
import { PregnancyAppointmentCard } from "@/components/cycle/PregnancyAppointmentCard";
import { PregnancyModeCard } from "@/components/cycle/PregnancyModeCard";
import { PregnancyNotesCard } from "@/components/cycle/PregnancyNotesCard";
import { PregnancySymptomCard } from "@/components/cycle/PregnancySymptomCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getPregnancyProfile } from "@/lib/cycleStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { PregnancyProfile } from "@/types/cycle";

export default function CycleScreen() {
  const [moduleEnabled, setModuleEnabled] = useState(false);
  const [pregnancyProfile, setPregnancyProfile] =
    useState<PregnancyProfile | null>(null);

  const loadCycleScreen = useCallback(async () => {
    const [preferences, profile] = await Promise.all([
      getUserPreferences(),
      getPregnancyProfile()
    ]);

    setModuleEnabled(preferences.enabledModules.includes("pregnancy_cycle"));
    setPregnancyProfile(profile);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCycleScreen();
    }, [loadCycleScreen])
  );

  const pregnancyModeActive =
    pregnancyProfile &&
    pregnancyProfile.status !== "not_tracking" &&
    pregnancyProfile.status !== "postpartum";

  const showPregnancySymptomTools =
    pregnancyProfile?.status === "possible" ||
    pregnancyProfile?.status === "pregnant" ||
    pregnancyProfile?.status === "trying" ||
    pregnancyProfile?.status === "not_sure";

  if (!moduleEnabled) {
    return (
      <ScreenWrapper>
        <View style={{ gap: 4 }}>
          <Text style={{ color: "#64748b", fontSize: 14 }}>Optional module</Text>
          <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
            Pregnancy & Cycle
          </Text>
        </View>

        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            This module is turned off
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Use this only if it helps you. You can turn this module off anytime.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Private tracker</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Pregnancy & Cycle
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Private tracking for cycle patterns, symptoms and pregnancy planning.
        </Text>
      </View>

      <CyclePrivacyCard />
      <CycleDisclaimerCard />
      <CyclePredictionCard />
      <CycleSettingsCard onChange={loadCycleScreen} />
      <CycleLogCard onChange={loadCycleScreen} />
      <CycleCalendarCard />
      <PregnancyModeCard onChange={setPregnancyProfile} />

      {showPregnancySymptomTools && pregnancyProfile ? (
        <PregnancySymptomCard
          onChange={loadCycleScreen}
          pregnancyProfileId={pregnancyProfile.id}
        />
      ) : null}

      {pregnancyModeActive ? (
        <>
          <PregnancyAppointmentCard
            onChange={loadCycleScreen}
            pregnancyProfileId={pregnancyProfile.id}
          />
          <PregnancyNotesCard
            onChange={loadCycleScreen}
            pregnancyProfileId={pregnancyProfile.id}
          />
        </>
      ) : null}
    </ScreenWrapper>
  );
}
