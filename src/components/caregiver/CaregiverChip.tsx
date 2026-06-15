import { Text, TouchableOpacity } from "react-native";

type CaregiverChipProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

export function CaregiverChip({
  label,
  onPress,
  selected,
}: CaregiverChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? "#eef2ff" : "#f8fafc",
        borderColor: selected ? "#a5b4fc" : "#e2e8f0",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text
        style={{ color: selected ? "#4f46e5" : "#475569", fontWeight: "800" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
