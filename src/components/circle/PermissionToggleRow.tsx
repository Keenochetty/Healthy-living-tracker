import { Switch, Text, View } from "react-native";

type PermissionToggleRowProps = {
  description: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

export function PermissionToggleRow({
  description,
  disabled = false,
  label,
  onValueChange,
  value,
}: PermissionToggleRowProps) {
  return (
    <View
      style={{
        alignItems: "center",
        borderBottomColor: "#f1f5f9",
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: 12,
        paddingVertical: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: disabled ? "#94a3b8" : "#0f172a", fontWeight: "800" }}
        >
          {label}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 18, marginTop: 3 }}>
          {description}
        </Text>
      </View>

      <Switch
        disabled={disabled}
        ios_backgroundColor="#e2e8f0"
        onValueChange={onValueChange}
        thumbColor={value ? "#ffffff" : "#f8fafc"}
        trackColor={{ false: "#e2e8f0", true: "#c4b5fd" }}
        value={value}
      />
    </View>
  );
}
