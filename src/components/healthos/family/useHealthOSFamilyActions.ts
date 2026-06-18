import { Linking } from "react-native";
import { router } from "expo-router";

import type {
  HealthOSCaregiverDisplay,
  HealthOSFamilyMemberDisplay,
  HealthOSSharedEventDisplay,
} from "./HealthOSFamilyTypes";

export function useHealthOSFamilyActions({
  onSelectMember,
}: {
  onSelectMember?: (member: HealthOSFamilyMemberDisplay) => void;
} = {}) {
  function go(route: string) {
    router.push(route as never);
  }

  return {
    contactMember(member: HealthOSFamilyMemberDisplay) {
      if (member.contactPhone) {
        void Linking.openURL(`tel:${member.contactPhone}`);
      } else if (member.contactEmail) {
        void Linking.openURL(`mailto:${member.contactEmail}`);
      }
    },
    openCalendar() {
      go("/(tabs)/calendar");
    },
    openCaregiver(caregiver?: HealthOSCaregiverDisplay) {
      go(caregiver ? `/caregiver/${caregiver.id}` : "/caregiver");
    },
    openCreateCircle() {
      go("/(tabs)/circle");
    },
    openFamilyNote() {
      go("/records");
    },
    openInvite() {
      go("/scan-invite");
    },
    openManageFamily() {
      go("/(tabs)/circle");
    },
    openMemberProfile(member: HealthOSFamilyMemberDisplay) {
      onSelectMember?.(member);
    },
    openNotifications() {
      go("/settings/notifications");
    },
    openPermissions() {
      go("/settings/privacy-center");
    },
    openSharedCalendar() {
      go("/(tabs)/calendar");
    },
    openSharedEvent(event?: HealthOSSharedEventDisplay) {
      go(event?.routeTarget ? String(event.routeTarget) : "/(tabs)/calendar");
    },
  };
}
