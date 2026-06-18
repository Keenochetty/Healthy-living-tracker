import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { BookOpen } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  text: string;
};

export function HealthOSContentEmptyState({ text }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard variant="compact">
      <View style={styles.row}>
        <BookOpen color={palette.softText} size={18} />
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {text}
        </Text>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
