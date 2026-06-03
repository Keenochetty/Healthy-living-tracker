import { Text } from "react-native";

import { AppCard } from "@/components/ui/AppCard";

export function FitnessDisclaimerCard() {
  return (
    <AppCard backgroundColor="#f0fdf4">
      <Text style={{ color: "#166534", fontSize: 18, fontWeight: "900" }}>
        Move safely
      </Text>
      <Text style={{ color: "#166534", lineHeight: 21, marginTop: 6 }}>
        This app helps you plan and track workouts. It does not replace advice from
        a healthcare or fitness professional.
      </Text>
      <Text style={{ color: "#166534", lineHeight: 21, marginTop: 6 }}>
        Stop and seek help if you feel chest pain, faintness, severe pain, or
        symptoms that worry you.
      </Text>
    </AppCard>
  );
}
