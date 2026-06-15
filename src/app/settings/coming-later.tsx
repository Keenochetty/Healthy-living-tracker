import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppChip, AppSection } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function ComingLaterSettingScreen() {
  const params = useLocalSearchParams<{
    description?: string;
    group?: string;
    title?: string;
  }>();
  const { theme } = useAppTheme();
  const title = asText(params.title) || "Setting";
  const group = asText(params.group) || "Settings";
  const description =
    asText(params.description) ||
    "This feature is planned but is not available yet.";

  return (
    <AppMainLayout subtitle={group} title={title}>
      <AppCard variant="soft">
        <AppChip label="Coming later" variant="muted" />
        <Text
          style={{
            color: theme.text,
            fontSize: 22,
            fontWeight: "900",
            marginTop: 14,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: theme.mutedText, lineHeight: 21, marginTop: 8 }}>
          {description}
        </Text>
      </AppCard>
      <AppSection title="Availability">
        <AppCard>
          <Text style={{ color: theme.text, fontWeight: "900" }}>
            Not currently implemented
          </Text>
          <Text
            style={{ color: theme.mutedText, lineHeight: 21, marginTop: 6 }}
          >
            This placeholder is intentionally marked so it is not presented as a
            finished feature.
          </Text>
        </AppCard>
      </AppSection>
    </AppMainLayout>
  );
}

function asText(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
