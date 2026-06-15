import { Text, View } from "react-native";
import { AppModule } from "@/types/app";
import { AppCard, AppChip, AppIcon, AppToggleRow } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

type ModuleCardProps = {
  module: AppModule;
  enabled: boolean;
  onToggle: () => void;
};

export function ModuleCard({ module, enabled, onToggle }: ModuleCardProps) {
  const { theme } = useAppTheme();

  if (!module.core) {
    return (
      <AppToggleRow
        description={module.description}
        icon={
          <AppIcon
            container
            containerVariant={enabled ? "soft" : "white"}
            name={module.key}
            size={22}
            variant={enabled ? "primary" : "muted"}
          />
        }
        onValueChange={onToggle}
        title={module.name}
        value={enabled}
      />
    );
  }

  return (
    <AppCard
      backgroundColor={enabled ? theme.primarySoft : theme.surface}
      padding="md"
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 14 }}>
        <View
          style={{
            alignItems: "center",
            borderRadius: 18,
            height: 46,
            justifyContent: "center",
            width: 46,
          }}
        >
          <AppIcon
            container
            containerVariant="white"
            name={module.key}
            size={22}
            variant="primary"
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
            <Text
              style={{ color: theme.text, fontSize: 16, fontWeight: "800" }}
            >
              {module.name}
            </Text>
            <AppChip label="Core" variant="primary" />
          </View>

          <Text
            style={{ color: theme.mutedText, lineHeight: 19, marginTop: 4 }}
          >
            {module.description}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}
