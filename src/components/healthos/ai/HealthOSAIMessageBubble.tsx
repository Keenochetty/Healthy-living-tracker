import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSAIMessage } from "./HealthOSAITypes";

type Props = {
  message: HealthOSAIMessage;
};

export function HealthOSAIMessageBubble({ message }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : surfaces.glassPanel,
          message.status === "error" && styles.errorBubble,
          { backgroundColor: isUser ? palette.ai : undefined },
        ]}
      >
        <Text
          style={[
            healthOSTypography.body,
            { color: isUser ? palette.deepNavy : palette.inkText },
          ]}
        >
          {message.content}
        </Text>
        {message.sources?.length ? (
          <View style={styles.sources}>
            {message.sources.slice(0, 3).map((source) => (
              <Text
                key={`${source.title}-${source.url}`}
                style={[healthOSTypography.caption, { color: palette.softText }]}
              >
                Source: {source.title}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    borderRadius: healthOSRadius.xl,
    maxWidth: "88%",
    padding: healthOSSpacing.md,
  },
  errorBubble: {
    opacity: 0.86,
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  sources: {
    gap: healthOSSpacing.xs,
    marginTop: healthOSSpacing.sm,
  },
  userBubble: {
    borderBottomRightRadius: healthOSRadius.sm,
  },
  userRow: {
    justifyContent: "flex-end",
  },
});
