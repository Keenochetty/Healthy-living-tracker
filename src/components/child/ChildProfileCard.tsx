import { Text, TouchableOpacity, View } from "react-native";

import { getChildProfileTypeLabel } from "@/constants/childOptions";
import type { ChildSummary } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type ChildProfileCardProps = {
  onOpen?: () => void;
  summary: ChildSummary;
};

export function ChildProfileCard({ onOpen, summary }: ChildProfileCardProps) {
  const child = summary.child;

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onOpen}>
      <AppCard>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#f5f3ff",
              borderRadius: 22,
              height: 56,
              justifyContent: "center",
              width: 56,
            }}
          >
            <Text style={{ color: "#7c3aed", fontSize: 14, fontWeight: "900" }}>
              {child.avatarEmoji ?? "Child"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 19, fontWeight: "900" }}>
              {child.displayName}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 2 }}>
              {getChildProfileTypeLabel(child.profileType)} profile
            </Text>
            <Text style={{ color: "#94a3b8", lineHeight: 19, marginTop: 8 }}>
              {summary.latestFeed
                ? `Latest feed: ${summary.latestFeed.finishedAmountMl ?? summary.latestFeed.offeredAmountMl ?? 0} ml`
                : "No baby logs yet."}
            </Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}
