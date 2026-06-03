import { Text, TouchableOpacity } from "react-native";

type ElderChipProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

export function ElderChip({ label, onPress, selected }: ElderChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? "#ecfdf5" : "#f8fafc",
        borderColor: selected ? "#86efac" : "#e2e8f0",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9
      }}
    >
      <Text style={{ color: selected ? "#15803d" : "#475569", fontWeight: "800" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
