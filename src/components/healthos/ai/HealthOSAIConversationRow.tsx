import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { MessageSquareText } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSAIConversationRowItem } from "./HealthOSAITypes";

type Props = {
  item: HealthOSAIConversationRowItem;
};

export function HealthOSAIConversationRow({ item }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  return (
    <Pressable style={({ pressed }) => [surfaces.listRow, pressed && styles.pressed]}>
      <View style={styles.row}>
        <MessageSquareText color={palette.ai} size={18} />
        <View style={styles.copy}>
          <Text numberOfLines={1} style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={[healthOSTypography.caption, { color: palette.softText }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  pressed: {
    opacity: 0.76,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
