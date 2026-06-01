import { Pressable, StyleSheet, Text, View } from "react-native";

import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

export type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  value: T;
};

export function SegmentedControl<T extends string>({ onChange, options, value }: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selectedSegment]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.mist,
    borderColor: colors.border.soft,
    borderRadius: componentRadius.chip,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs
  },
  label: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  segment: {
    borderRadius: componentRadius.chip,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  selectedLabel: {
    color: colors.text.inverse
  },
  selectedSegment: {
    backgroundColor: colors.brand.primary
  }
});
