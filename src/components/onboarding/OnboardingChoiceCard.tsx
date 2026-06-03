import { Check } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type OnboardingChoiceCardProps = {
  description: string;
  disabled?: boolean;
  emoji: string;
  onPress: () => void;
  selected: boolean;
  title: string;
};

export function OnboardingChoiceCard({
  description,
  disabled = false,
  emoji,
  onPress,
  selected,
  title
}: OnboardingChoiceCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: selected ? "#f5f3ff" : "#ffffff",
        borderColor: selected ? "#c4b5fd" : "#f1f5f9",
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: "row",
        gap: 14,
        opacity: disabled ? 0.78 : 1,
        padding: 16
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: 18,
          height: 48,
          justifyContent: "center",
          width: 48
        }}
      >
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
          {title}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 4 }}>
          {description}
        </Text>
      </View>

      <View
        style={{
          alignItems: "center",
          backgroundColor: selected ? "#7c3aed" : "#e2e8f0",
          borderRadius: 13,
          height: 26,
          justifyContent: "center",
          width: 26
        }}
      >
        {selected ? <Check color="#ffffff" size={16} /> : null}
      </View>
    </TouchableOpacity>
  );
}
