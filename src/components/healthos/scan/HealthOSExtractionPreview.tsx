import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSExtractionState } from "./HealthOSScanTypes";

type HealthOSExtractionPreviewProps = {
  state: HealthOSExtractionState;
};

export function HealthOSExtractionPreview({ state }: HealthOSExtractionPreviewProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const copy = getCopy(state);

  return (
    <HealthOSCard variant={state === "error" ? "danger" : "compact"}>
      <View style={styles.stack}>
        <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
          {copy.title}
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {copy.body}
        </Text>
      </View>
    </HealthOSCard>
  );
}

function getCopy(state: HealthOSExtractionState) {
  if (state === "loading") {
    return {
      body: "Preparing a reviewed extraction preview.",
      title: "Checking image",
    };
  }
  if (state === "error") {
    return {
      body: "Extraction could not start. The image has not been saved or imported.",
      title: "Extraction unavailable",
    };
  }
  if (state === "extracted") {
    return {
      body: "Structured results will require user review before import.",
      title: "Review required",
    };
  }
  return {
    body: "AI extraction will appear here after the backend connection is enabled. No health data is saved automatically.",
    title: "Extraction preview",
  };
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.xs,
  },
});
