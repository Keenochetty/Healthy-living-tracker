import { ChevronDown } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppAvatar } from "@/components/ui";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type HealthSyncIdentityControlProps = {
  avatarUri?: string;
  initials: string;
  name: string;
  onOpenPeopleAccount: () => void;
  onOpenProfile: () => void;
  pageTitle?: string;
  relationship: string;
};

export function HealthSyncIdentityControl({
  avatarUri,
  initials,
  name,
  onOpenPeopleAccount,
  onOpenProfile,
  pageTitle,
  relationship,
}: HealthSyncIdentityControlProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel={`Open ${name}'s profile`}
        accessibilityRole="button"
        onPress={onOpenProfile}
        style={({ pressed }) => [
          styles.avatarButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppAvatar imageUri={avatarUri} initials={initials} size={46} />
      </Pressable>
      <Pressable
        accessibilityHint="Opens People and Account"
        accessibilityLabel={`Viewing ${name}, ${relationship}`}
        accessibilityRole="button"
        onPress={onOpenPeopleAccount}
        style={({ pressed }) => [
          styles.identityButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <View style={styles.copy}>
          <Text
            numberOfLines={1}
            style={[styles.context, { color: theme.mutedText }]}
          >
            {pageTitle ? `${pageTitle} - viewing` : "Viewing"}
          </Text>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {name}
          </Text>
        </View>
        <ChevronDown color={theme.mutedText} size={18} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarButton: { borderRadius: 999 },
  context: { fontSize: 12, fontWeight: "700" },
  copy: { flex: 1, minWidth: 0 },
  identityButton: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 48,
  },
  name: { fontSize: 18, fontWeight: "900", marginTop: 2 },
  pressed: { opacity: 0.72 },
  root: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    minWidth: 0,
  },
});
