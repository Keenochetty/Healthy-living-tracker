import { StyleSheet, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

type Props = {
  onEditProfile: () => void;
  onFamily: () => void;
  onNotifications: () => void;
  onPrivacy: () => void;
  onSecurity: () => void;
  onSubscription: () => void;
};

export function HealthOSAccountQuickActions({
  onEditProfile,
  onFamily,
  onNotifications,
  onPrivacy,
  onSecurity,
  onSubscription,
}: Props) {
  return (
    <View style={styles.wrap}>
      <HealthOSPill label="Edit profile" onPress={onEditProfile} variant="ai" />
      <HealthOSPill label="Security" onPress={onSecurity} variant="glass" />
      <HealthOSPill label="Privacy" onPress={onPrivacy} variant="glass" />
      <HealthOSPill label="Notifications" onPress={onNotifications} variant="glass" />
      <HealthOSPill label="Subscription" onPress={onSubscription} variant="glass" />
      <HealthOSPill label="Family sharing" onPress={onFamily} variant="glass" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
