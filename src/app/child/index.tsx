import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AddChildProfileCard } from "@/components/child/AddChildProfileCard";
import { ChildDisclaimerCard } from "@/components/child/ChildDisclaimerCard";
import { ChildProfileCard } from "@/components/child/ChildProfileCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getAllChildSummaries } from "@/lib/childStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { ChildSummary } from "@/types/child";

export default function ChildIndexScreen() {
  const [childEnabled, setChildEnabled] = useState(false);
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);

  const loadChildModule = useCallback(async () => {
    const [preferences, nextSummaries] = await Promise.all([
      getUserPreferences(),
      getAllChildSummaries()
    ]);

    setChildEnabled(preferences.enabledModules.includes("child_baby"));
    setSummaries(nextSummaries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChildModule();
    }, [loadChildModule])
  );

  if (!childEnabled) {
    return (
      <ScreenWrapper>
        <View style={{ gap: 4 }}>
          <Text style={{ color: "#64748b", fontSize: 14 }}>Optional module</Text>
          <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
            Child & Baby
          </Text>
        </View>

        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            This module is turned off
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            The app does not assume you have children. Enable Child & Baby in Profile
            modules only if it is useful for you.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Parent-controlled</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Child & Baby
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Add child profiles only when you need them. Baby tools are optional.
        </Text>
      </View>

      <ChildDisclaimerCard />

      {summaries.length ? (
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
            Profiles
          </Text>
          {summaries.map((summary) => (
            <ChildProfileCard
              key={summary.child.id}
              onOpen={() => router.push(`/child/${summary.child.id}` as Href)}
              summary={summary}
            />
          ))}
        </View>
      ) : (
        <AppCard backgroundColor="#f5f3ff">
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            No child profile yet
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Create one only if you want to track child or baby care. Nothing is added
            automatically.
          </Text>
        </AppCard>
      )}

      <AddChildProfileCard onCreated={() => loadChildModule()} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.back()}
        style={{
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: 18,
          minHeight: 52,
          justifyContent: "center"
        }}
      >
        <Text style={{ color: "#7c3aed", fontSize: 16, fontWeight: "900" }}>
          Back
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
