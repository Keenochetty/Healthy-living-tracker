import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSAIConversationRowItem } from "./HealthOSAITypes";
import { HealthOSAIConversationRow } from "./HealthOSAIConversationRow";

type Props = {
  conversations: HealthOSAIConversationRowItem[];
};

export function HealthOSAIHistoryPanel({ conversations }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard title="Chat history" subtitle="Stored as local assistant summaries">
      <View style={styles.stack}>
        {conversations.length ? (
          conversations.map((item) => <HealthOSAIConversationRow key={item.id} item={item} />)
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Your recent HealthOS AI conversations will appear here after you send a message.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.sm,
  },
});
