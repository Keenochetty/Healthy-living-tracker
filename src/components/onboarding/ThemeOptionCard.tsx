import { Check } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import type { UserThemeOption } from "@/constants/themes";

type ThemeOptionCardProps = {
  onPress: () => void;
  selected: boolean;
  theme: UserThemeOption;
};

export function ThemeOptionCard({
  onPress,
  selected,
  theme,
}: ThemeOptionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: selected ? theme.soft : "#ffffff",
        borderColor: selected ? theme.primary : "#f1f5f9",
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: "row",
        gap: 14,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", gap: 5 }}>
        <View
          style={{
            backgroundColor: theme.primary,
            borderRadius: 10,
            height: 20,
            width: 20,
          }}
        />
        <View
          style={{
            backgroundColor: theme.background,
            borderColor: "#e2e8f0",
            borderRadius: 10,
            borderWidth: 1,
            height: 20,
            width: 20,
          }}
        />
        <View
          style={{
            backgroundColor: theme.soft,
            borderRadius: 10,
            height: 20,
            width: 20,
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
          {theme.name}
        </Text>
        <Text style={{ color: "#64748b", marginTop: 4 }}>
          {theme.description}
        </Text>
      </View>

      <View
        style={{
          alignItems: "center",
          backgroundColor: selected ? theme.primary : "#e2e8f0",
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
