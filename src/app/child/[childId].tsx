import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { BabyFeedTrackerCard } from "@/components/child/BabyFeedTrackerCard";
import { BabySleepLogCard } from "@/components/child/BabySleepLogCard";
import { ChildDisclaimerCard } from "@/components/child/ChildDisclaimerCard";
import { ChildSummaryCard } from "@/components/child/ChildSummaryCard";
import { DiaperLogCard } from "@/components/child/DiaperLogCard";
import { GrowthMeasurementCard } from "@/components/child/GrowthMeasurementCard";
import { MilestoneTrackerCard } from "@/components/child/MilestoneTrackerCard";
import { VaccinationRecordCard } from "@/components/child/VaccinationRecordCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getChildSummary } from "@/lib/childStorage";
import type { ChildSummary } from "@/types/child";

export default function ChildDetailScreen() {
  const params = useLocalSearchParams<{ childId?: string }>();
  const childId = Array.isArray(params.childId) ? params.childId[0] : params.childId;
  const [summary, setSummary] = useState<ChildSummary | null>(null);

  const loadSummary = useCallback(async () => {
    if (!childId) return;

    setSummary(await getChildSummary(childId));
  }, [childId]);

  useEffect(() => {
    if (!childId) return;

    let isActive = true;

    getChildSummary(childId).then((nextSummary) => {
      if (isActive) {
        setSummary(nextSummary);
      }
    });

    return () => {
      isActive = false;
    };
  }, [childId]);

  if (!childId || !summary) {
    return (
      <ScreenWrapper>
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Child profile not found
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            This local profile may have been removed.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  const showBabyTools =
    summary.child.profileType === "baby" || summary.child.profileType === "toddler";

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Child profile</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {summary.child.displayName}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Private, parent-controlled care information.
        </Text>
      </View>

      <ChildDisclaimerCard />
      <ChildSummaryCard summary={summary} />

      {showBabyTools ? (
        <>
          <BabyFeedTrackerCard childId={childId} onChange={loadSummary} />
          <BabySleepLogCard
            childId={childId}
            latestSleep={summary.latestSleep}
            onChange={loadSummary}
          />
          <DiaperLogCard
            childId={childId}
            latestDiaper={summary.latestDiaper}
            onChange={loadSummary}
          />
        </>
      ) : (
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Baby tools are hidden
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Feeding and diaper tools are mainly for baby and toddler profiles. This keeps
            older child profiles simpler.
          </Text>
        </AppCard>
      )}

      <GrowthMeasurementCard
        childId={childId}
        latestGrowth={summary.latestGrowth}
        onChange={loadSummary}
      />
      <MilestoneTrackerCard childId={childId} onChange={loadSummary} />
      <VaccinationRecordCard childId={childId} onChange={loadSummary} />
    </ScreenWrapper>
  );
}
