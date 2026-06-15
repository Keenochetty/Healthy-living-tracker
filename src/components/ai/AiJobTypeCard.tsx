import { Text, TouchableOpacity, View } from "react-native";

import type { AiJobType } from "@/types/ai";

type AiJobTypeCardProps = {
  description: string;
  emoji: string;
  label: string;
  onSelect: (jobType: AiJobType) => void;
  selected: boolean;
  value: AiJobType;
};

export function AiJobTypeCard({
  description,
  emoji,
  label,
  onSelect,
  selected,
  value,
}: AiJobTypeCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(value)}
      style={{
        backgroundColor: selected ? "#f5f3ff" : "#ffffff",
        borderColor: selected ? "#c4b5fd" : "#e2e8f0",
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
          backgroundColor: "#ede9fe",
          borderRadius: 16,
          height: 42,
          justifyContent: "center",
          width: 42,
        }}
      >
        <Text style={{ color: "#7c3aed", fontWeight: "900" }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
          {label}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 3 }}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
