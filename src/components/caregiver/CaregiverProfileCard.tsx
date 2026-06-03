import { Text, TouchableOpacity, View } from "react-native";

import { getCaregiverServiceLabel } from "@/constants/caregiverOptions";
import type { CaregiverSummary } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";

type CaregiverProfileCardProps = {
  onBook?: () => void;
  onInvite?: () => void;
  onOpen?: () => void;
  summary: CaregiverSummary;
};

export function CaregiverProfileCard({ onBook, onInvite, onOpen, summary }: CaregiverProfileCardProps) {
  const rate = summary.rates.find((item) => item.active);

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ alignItems: "center", backgroundColor: "#eef2ff", borderRadius: 20, height: 56, justifyContent: "center", width: 56 }}>
            <Text style={{ color: "#4f46e5", fontWeight: "900" }}>Photo</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 19, fontWeight: "900" }}>
              {summary.caregiver.displayName}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {summary.caregiver.services.slice(0, 2).map(getCaregiverServiceLabel).join(", ") || "No services yet"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {summary.caregiver.country} - {summary.caregiver.currency}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              Rate: {rate ? `${rate.currency} ${rate.amount}/${rate.rateType}` : "Not set"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              Availability rows: {summary.availability.length}
            </Text>
            <Text style={{ color: summary.caregiver.verified ? "#059669" : "#9a3412", marginTop: 3 }}>
              {summary.caregiver.verified ? "Verified" : "Not verified - verify details yourself"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              Connection: {summary.connectionStatus ?? "none"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <CardButton label="Open" onPress={onOpen} />
          <CardButton label="Invite/QR" onPress={onInvite} tone="secondary" />
          <CardButton label="Book" onPress={onBook} tone="secondary" />
        </View>
      </View>
    </AppCard>
  );
}

function CardButton({ label, onPress, tone = "primary" }: { label: string; onPress?: () => void; tone?: "primary" | "secondary" }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: tone === "primary" ? "#4f46e5" : "#eef2ff",
        borderRadius: 14,
        flex: 1,
        justifyContent: "center",
        minHeight: 44
      }}
    >
      <Text style={{ color: tone === "primary" ? "#ffffff" : "#4f46e5", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
