import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";

import { componentRadius } from "@/constants/radius";
import { layoutSpacing, spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type MetricInputProps = {
  keyboardType?: KeyboardTypeOptions;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unit?: string;
  value: string;
};

export function MetricInput({
  keyboardType = "decimal-pad",
  label,
  onChangeText,
  placeholder,
  unit,
  value
}: MetricInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          value={value}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    minHeight: layoutSpacing.touchTarget
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: componentRadius.input,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  label: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "700"
  },
  unit: {
    color: colors.text.muted,
    fontSize: 15,
    fontWeight: "700"
  }
});
