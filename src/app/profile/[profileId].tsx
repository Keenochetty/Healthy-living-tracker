import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppSection } from "@/components/ui";
import { formatRelationship } from "@/components/identity";
import { getProfilesVisibleToUser } from "@/lib/familyPermissionsStorage";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { HealthProfile } from "@/types/familyPermissions";

export default function ViewedProfileScreen() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const { theme } = useAppTheme();
  const [profile, setProfile] = useState<HealthProfile | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getProfilesVisibleToUser().then((profiles) => {
      setProfile(profiles.find((item) => item.id === profileId) ?? null);
    });
  }, [profileId]);

  return (
    <AppMainLayout
      subtitle="Permitted profile"
      title={profile?.displayName ?? "Profile"}
    >
      {profile === undefined ? (
        <AppCard>
          <Text style={{ color: theme.mutedText }}>Loading profile...</Text>
        </AppCard>
      ) : profile ? (
        <>
          <AppCard variant="primary">
            <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "900" }}>
              {profile.displayName}
            </Text>
            <Text style={{ color: "#ffffff", lineHeight: 21, marginTop: 8 }}>
              {formatRelationship(profile)}
            </Text>
          </AppCard>
          <AppSection
            title="Profile access"
            subtitle="Only information permitted for the signed-in account is shown."
          >
            <AppCard>
              <Text style={{ color: theme.text, fontWeight: "900" }}>
                Viewed person
              </Text>
              <Text
                style={{ color: theme.mutedText, lineHeight: 21, marginTop: 6 }}
              >
                Switching viewed person changes the data context only. It does
                not change the authenticated account.
              </Text>
            </AppCard>
          </AppSection>
        </>
      ) : (
        <AppCard variant="warning">
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
            Profile unavailable
          </Text>
          <Text
            style={{ color: theme.mutedText, lineHeight: 21, marginTop: 6 }}
          >
            This profile is not available to the signed-in account.
          </Text>
        </AppCard>
      )}
    </AppMainLayout>
  );
}
