import { Check } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeProvider";

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
  title,
}: OnboardingChoiceCardProps) {
  const { theme } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: selected ? theme.primarySoft : theme.surface,
        borderColor: selected ? theme.primary : theme.border,
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: "row",
        gap: 14,
        opacity: disabled ? 0.78 : 1,
        padding: 16,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.surface,
          borderRadius: 18,
          height: 48,
          justifyContent: "center",
          width: 48,
        }}
      >
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>
          {title}
        </Text>
        <Text style={{ color: theme.mutedText, lineHeight: 19, marginTop: 4 }}>
          {description}
        </Text>
      </View>

      <View
        style={{
          alignItems: "center",
          backgroundColor: selected ? theme.primary : theme.border,
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
