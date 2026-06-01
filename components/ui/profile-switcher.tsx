import { Pressable, StyleSheet, Text, View } from "react-native";

import { componentRadius } from "@/constants/radius";
import { layoutSpacing, spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { ChildAvatar } from "@/components/ui/child-avatar";

type ProfileSwitcherProps = {
  familyName?: string | null;
  modeLabel?: string;
  onPress?: () => void;
  profileName: string;
};

export function ProfileSwitcher({ familyName, modeLabel, onPress, profileName }: ProfileSwitcherProps) {
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <ChildAvatar name={profileName} size={44} subtitle={familyName ?? "Personal"} />
      {modeLabel ? (
        <View style={styles.mode}>
          <Text style={styles.modeText}>{modeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: componentRadius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: layoutSpacing.touchTarget + 12,
    padding: spacing.md
  },
  mode: {
    backgroundColor: colors.brand.primarySoft,
    borderRadius: componentRadius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  modeText: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.78
  }
});
