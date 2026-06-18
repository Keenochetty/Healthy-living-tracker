import { Image, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Camera, Pencil } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";

type Props = {
  data: HealthOSProfileSettingsData;
  onEditProfile: () => void;
  onPhotoActions: () => void;
};

export function HealthOSProfileHeroCard({ data, onEditProfile, onPhotoActions }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const name = data.profile?.displayName ?? data.profile?.fullName ?? "Your profile";
  const email = data.profile?.email ?? data.authUser?.email ?? "No signed-in email";
  const initials = makeInitials(name || email || "HS");

  return (
    <HealthOSCard variant="glass">
      <View style={styles.row}>
        <Pressable
          accessibilityLabel="Open profile photo actions"
          accessibilityRole="button"
          onPress={onPhotoActions}
          style={[styles.avatar, surfaces.aiSurface]}
        >
          {data.profilePhoto.previewUri ? (
            <Image source={{ uri: data.profilePhoto.previewUri }} style={styles.avatarImage} />
          ) : (
            <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
              {initials}
            </Text>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: palette.ai }]}>
            <Camera color={palette.deepNavy} size={13} />
          </View>
        </Pressable>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.micro, { color: palette.ai }]}>Profile control panel</Text>
          <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>{name}</Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>{email}</Text>
          {data.profile?.phone ? (
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>{data.profile.phone}</Text>
          ) : null}
          <View style={styles.chips}>
            <HealthOSPill label={data.authUser ? "Signed in" : "Local"} size="sm" variant={data.authUser ? "success" : "default"} />
            <HealthOSPill label="Privacy: private by default" size="sm" variant="glass" />
          </View>
        </View>
      </View>
      <Pressable accessibilityLabel="Edit profile" accessibilityRole="button" onPress={onEditProfile} style={styles.editRow}>
        <Pencil color={palette.ai} size={16} />
        <Text style={[healthOSTypography.buttonLabel, { color: palette.ai }]}>Edit profile details</Text>
      </Pressable>
    </HealthOSCard>
  );
}

function makeInitials(value: string) {
  return (
    value
      .split(/\s|@/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HS"
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    height: 76,
    justifyContent: "center",
    padding: 0,
    width: 76,
  },
  avatarImage: {
    borderRadius: healthOSRadius.pill,
    height: 76,
    width: 76,
  },
  cameraBadge: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    bottom: 0,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 24,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  editRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.lg,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});
