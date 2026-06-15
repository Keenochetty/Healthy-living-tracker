import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ELDER_EMERGENCY_DISCLAIMER } from "@/constants/elderOptions";
import type { ElderProfile } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";

type ElderEmergencyCardProps = {
  elder: ElderProfile;
};

export function ElderEmergencyCard({ elder }: ElderEmergencyCardProps) {
  const [showMedicalNotes, setShowMedicalNotes] = useState(false);

  return (
    <AppCard backgroundColor="#fff7ed">
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#9a3412", fontSize: 20, fontWeight: "900" }}>
            Emergency contact
          </Text>
          <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 4 }}>
            {ELDER_EMERGENCY_DISCLAIMER}
          </Text>
        </View>

        <Text style={{ color: "#0f172a", fontWeight: "900" }}>
          {elder.emergencyContactName ?? "No contact name recorded"}
        </Text>
        <Text style={{ color: "#64748b" }}>
          {elder.emergencyContactPhone ?? "No phone number recorded"}
        </Text>
        <Text style={{ color: "#64748b" }}>
          Primary doctor: {elder.primaryDoctor ?? "Not recorded"}
        </Text>

        <TouchableOpacity activeOpacity={0.85} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Call contact placeholder
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowMedicalNotes((current) => !current)}
          style={secondaryButtonStyle}
        >
          <Text style={{ color: "#9a3412", fontWeight: "900" }}>
            View medical notes
          </Text>
        </TouchableOpacity>

        {showMedicalNotes ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {elder.medicalNotes ?? "No medical notes recorded."}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#ea580c",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};

const secondaryButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#ffedd5",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
