import { Text, TouchableOpacity, View } from "react-native";

import { getElderCheckInStatusLabel } from "@/constants/elderOptions";
import type { ElderSummary } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";

type ElderProfileCardProps = {
  onOpen?: () => void;
  summary: ElderSummary;
};

export function ElderProfileCard({ onOpen, summary }: ElderProfileCardProps) {
  return (
    <AppCard backgroundColor={summary.needsAttention ? "#fff7ed" : "#ffffff"}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#ecfdf5",
              borderRadius: 20,
              height: 52,
              justifyContent: "center",
              width: 52
            }}
          >
            <Text style={{ color: "#059669", fontWeight: "900" }}>
              {summary.elder.avatarEmoji ?? summary.elder.displayName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 19, fontWeight: "900" }}>
              {summary.elder.displayName}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 2 }}>
              {summary.elder.relationship ?? "Elder profile"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 6 }}>
              Last check-in: {getElderCheckInStatusLabel(summary.latestCheckIn?.status)}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              Next appointment: {summary.nextAppointment?.appointmentDate ?? "None planned"}
            </Text>
          </View>
        </View>

        {summary.needsAttention ? (
          <Text style={{ color: "#9a3412", fontWeight: "900" }}>
            Needs attention - consider contacting them.
          </Text>
        ) : null}

        <TouchableOpacity activeOpacity={0.85} onPress={onOpen} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Open profile</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#059669",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 48
};
