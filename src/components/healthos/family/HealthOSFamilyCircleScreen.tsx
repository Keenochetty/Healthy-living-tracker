import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSCaregiverCard } from "./HealthOSCaregiverCard";
import { HealthOSFamilyHero } from "./HealthOSFamilyHero";
import { HealthOSFamilyInviteManageCard } from "./HealthOSFamilyInviteManageCard";
import { HealthOSFamilyMemberList } from "./HealthOSFamilyMemberList";
import { HealthOSFamilyQuickActions } from "./HealthOSFamilyQuickActions";
import type { HealthOSFamilyMemberDisplay } from "./HealthOSFamilyTypes";
import { HealthOSMemberProfileSheet } from "./HealthOSMemberProfileSheet";
import { HealthOSSharedEventsWidget } from "./HealthOSSharedEventsWidget";
import { HealthOSSharedOverviewWidget } from "./HealthOSSharedOverviewWidget";
import { useHealthOSFamilyActions } from "./useHealthOSFamilyActions";
import { useHealthOSFamilyCircle } from "./useHealthOSFamilyCircle";

export function HealthOSFamilyCircleScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const family = useHealthOSFamilyCircle();
  const [selectedMember, setSelectedMember] =
    useState<HealthOSFamilyMemberDisplay | null>(null);
  const [activeMenuMember, setActiveMenuMember] =
    useState<HealthOSFamilyMemberDisplay | null>(null);
  const actions = useHealthOSFamilyActions({
    onSelectMember: setSelectedMember,
  });

  return (
    <HealthOSAppShell
      activeNavKey="family"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Private family health"
      title="Family"
      withBottomNavSpace={false}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {family.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {family.error}
              </Text>
            </HealthOSCard>
          ) : null}

          <HealthOSFamilyHero
            circle={family.circle}
            eventsCount={family.sharedEvents.length}
            members={family.members}
            onInvite={actions.openInvite}
            onManage={actions.openManageFamily}
            updatesCount={family.sharedUpdates.length}
          />

          <HealthOSFamilyQuickActions
            onAddCaregiver={() => actions.openCaregiver()}
            onAddChild={() => actions.openManageFamily()}
            onFamilyNote={actions.openFamilyNote}
            onInvite={actions.openInvite}
            onManagePermissions={actions.openPermissions}
            onSharedEvent={actions.openCalendar}
          />

          <HealthOSSharedOverviewWidget
            emptyText={family.emptyState}
            updates={family.sharedUpdates}
          />

          <HealthOSFamilyMemberList
            activeMenuMember={activeMenuMember}
            members={family.members}
            onContact={actions.contactMember}
            onManagePermissions={actions.openPermissions}
            onNotifications={actions.openNotifications}
            onOpenMember={(member) => {
              setActiveMenuMember(null);
              setSelectedMember(member);
            }}
            onSetActiveMenuMember={setActiveMenuMember}
          />

          <HealthOSSharedEventsWidget
            events={family.sharedEvents}
            onOpenCalendar={actions.openCalendar}
            onOpenEvent={actions.openSharedEvent}
          />

          <HealthOSCaregiverCard
            caregiver={family.caregivers[0] ?? null}
            onAddCaregiver={() => actions.openCaregiver()}
            onOpenCaregiver={actions.openCaregiver}
          />

          <HealthOSFamilyInviteManageCard
            onInvite={actions.openInvite}
            onManageFamily={actions.openManageFamily}
            onManagePermissions={actions.openPermissions}
            pendingInvitesCount={family.pendingInvites.length}
          />

          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            Private health details stay hidden unless an existing permission explicitly shares them.
          </Text>
        </View>
      </ScrollView>

      <HealthOSMemberProfileSheet
        member={selectedMember}
        notifications={
          selectedMember ? family.getMemberNotifications(selectedMember.id) : undefined
        }
        onClose={() => setSelectedMember(null)}
        onContact={() => {
          if (selectedMember) actions.contactMember(selectedMember);
        }}
        onManageNotifications={actions.openNotifications}
        onManagePermissions={actions.openPermissions}
        onSharedCalendar={actions.openSharedCalendar}
      />
    </HealthOSAppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: healthOSSpacing.lg,
    maxWidth: healthOSLayout.screenMaxWidth,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: healthOSSafeArea.bottomNavSpace + healthOSSpacing.xl,
  },
});

