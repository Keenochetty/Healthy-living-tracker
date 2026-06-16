import {
  Button,
  Host,
  ProgressView,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import { useAppTheme } from "@/theme/ThemeProvider";

export function NativeSettingsPreview() {
  const { themeKey } = useAppTheme();

  return (
    <Host
      colorScheme={themeKey.includes("dark") ? "dark" : "light"}
      matchContents={{ vertical: true }}
      style={{ minHeight: 130 }}
    >
      <VStack alignment="leading" spacing={10}>
        <Text>Native HealthSync preview</Text>
        <ProgressView value={0.72}>
          <Text>Daily health setup</Text>
        </ProgressView>
        <Button label="Review settings" onPress={() => undefined} />
      </VStack>
    </Host>
  );
}
