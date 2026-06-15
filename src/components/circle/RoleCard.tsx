import { Check } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import type { CircleRoleDefinition } from "@/constants/circleRoles";

type RoleCardProps = {
  onSelect: () => void;
  role: CircleRoleDefinition;
  selected: boolean;
};

export function RoleCard({ onSelect, role, selected }: RoleCardProps) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      activeOpacity={0.85}
      onPress={onSelect}
      style={{
        alignItems: "center",
        backgroundColor: selected ? "#f5f3ff" : "#ffffff",
        borderColor: selected ? "#c4b5fd" : "#f1f5f9",
        borderRadius: 22,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        padding: 14,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          height: 42,
          justifyContent: "center",
          width: 42,
        }}
      >
        <Text style={{ fontSize: 22 }}>{role.emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#0f172a", fontSize: 15, fontWeight: "800" }}>
          {role.label}
        </Text>
        <Text
          style={{
            color: "#64748b",
            fontSize: 12,
            lineHeight: 17,
            marginTop: 3,
          }}
        >
          {role.description}
        </Text>
      </View>

      <View
        style={{
          alignItems: "center",
          backgroundColor: selected ? "#7c3aed" : "#e2e8f0",
          borderRadius: 13,
          height: 26,
          justifyContent: "center",
          width: 26,
        }}
      >
        {selected ? <Check color="#ffffff" size={16} /> : null}
      </View>
    </TouchableOpacity>
  );
}
