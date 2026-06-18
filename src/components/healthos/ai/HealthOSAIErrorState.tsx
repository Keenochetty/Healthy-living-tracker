import { Text, useColorScheme } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  message: string;
};

export function HealthOSAIErrorState({ message }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard title="AI backend unavailable" variant="danger">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>{message}</Text>
    </HealthOSCard>
  );
}
