import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon, AppSection } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  CaregiverProfile,
  FamilyCircle,
  FamilyCircleMember,
  FamilyInvite,
  HealthProfile,
  ProfilePermission,
} from "@/types/familyPermissions";

const FAMILY = "#b7791f";
const FAMILY_SOFT = "#fef3c7";

export function FamilyRealmOverview({
  caregivers,
  circle,
  invites,
  members,
  onCaregivers,
  onInvites,
  onMembers,
  onPermissions,
  onProfiles,
  permissions,
  profiles,
}: {
  caregivers: CaregiverProfile[];
  circle: FamilyCircle | null;
  invites: FamilyInvite[];
  members: FamilyCircleMember[];
  onCaregivers: () => void;
  onInvites: () => void;
  onMembers: () => void;
  onPermissions: () => void;
  onProfiles: () => void;
  permissions: ProfilePermission[];
  profiles: HealthProfile[];
}) {
  const childProfiles = profiles.filter(
    (profile) =>
      profile.profileType === "child" ||
      profile.profileType === "teen" ||
      profile.legacySource === "child",
  );
  return (
    <View style={styles.stack}>
      <FamilyHero
        circle={circle}
        invites={invites.length}
        members={members}
        permissions={permissions.length}
      />
      <FamilyMembers members={members} onOpen={onMembers} />
      <PermissionOverview onOpen={onPermissions} permissions={permissions} />
      <CaregiverOverview caregivers={caregivers} onOpen={onCaregivers} />
      <PendingInvites invites={invites} onOpen={onInvites} />
      <LinkedChildren onOpen={onProfiles} profiles={childProfiles} />
    </View>
  );
}

function FamilyHero({
  circle,
  invites,
  members,
  permissions,
}: {
  circle: FamilyCircle | null;
  invites: number;
  members: FamilyCircleMember[];
  permissions: number;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.hero, { borderColor: `${FAMILY}38` }]}>
      <View style={styles.heroGlow} />
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>FAMILY CIRCLE</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            {circle?.name ?? "Your family health circle"}
          </Text>
          <Text style={[styles.heroBody, { color: theme.mutedText }]}>
            Family relationships, caregiver contacts, and selected sharing
            permissions in one clear place.
          </Text>
        </View>
        <View style={styles.avatarStack}>
          {members.slice(0, 3).map((member, index) => (
            <View
              key={member.id}
              style={[
                styles.stackAvatar,
                {
                  backgroundColor: index % 2 ? "#ffedd5" : FAMILY_SOFT,
                  marginLeft: index ? -10 : 0,
                },
              ]}
            >
              <Text style={styles.stackAvatarText}>
                {initials(member.displayName)}
              </Text>
            </View>
          ))}
          {!members.length ? (
            <View style={styles.stackAvatar}>
              <AppIcon color={FAMILY} decorative name="circle" size={22} />
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.heroStats}>
        <HeroStat label="Members" value={`${members.length}`} />
        <HeroStat label="Permissions" value={`${permissions}`} />
        <HeroStat label="Pending" value={`${invites}`} />
      </View>
      <View style={styles.circleBadge}>
        <Text style={styles.circleBadgeText}>
          {circle
            ? `${formatLabel(circle.type)} | ${formatLabel(circle.defaultPrivacyLevel)}`
            : "Ready for your first circle"}
        </Text>
      </View>
    </AppCard>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function FamilyMembers({
  members,
  onOpen,
}: {
  members: FamilyCircleMember[];
  onOpen: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      actionLabel="Manage"
      onActionPress={onOpen}
      subtitle="Relationships and roles inside this circle."
      title="Family members"
    >
      <View style={styles.memberGrid}>
        {members.length ? (
          members.slice(0, 4).map((member) => (
            <Pressable
              accessibilityRole="button"
              key={member.id}
              onPress={onOpen}
              style={({ pressed }) => [
                styles.memberCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {initials(member.displayName)}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[styles.memberName, { color: theme.text }]}
              >
                {member.displayName}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {formatLabel(member.role)}
                </Text>
              </View>
              <Text style={[styles.memberStatus, { color: theme.mutedText }]}>
                {formatLabel(member.inviteStatus)}
              </Text>
            </Pressable>
          ))
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onOpen}
            style={[
              styles.emptyCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Add family members
            </Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>
              Relationships become visible here after profiles are added to the
              circle.
            </Text>
          </Pressable>
        )}
      </View>
    </AppSection>
  );
}

function PermissionOverview({
  onOpen,
  permissions,
}: {
  onOpen: () => void;
  permissions: ProfilePermission[];
}) {
  const { theme } = useAppTheme();
  const visible = permissions.slice(0, 4);
  return (
    <AppSection
      actionLabel="Review"
      onActionPress={onOpen}
      subtitle="Sharing remains selected and explicit."
      title="Permissions and sharing"
    >
      <Pressable accessibilityRole="button" onPress={onOpen}>
        <AppCard style={[styles.permissionCard, { borderColor: theme.border }]}>
          <View style={styles.permissionHeader}>
            <View style={styles.permissionIcon}>
              <AppIcon color={FAMILY} decorative name="privacy" size={22} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {permissions.length
                  ? `${permissions.length} selected permissions`
                  : "Private by default"}
              </Text>
              <Text style={[styles.cardBody, { color: theme.mutedText }]}>
                Each permission shows what can be viewed or updated.
              </Text>
            </View>
          </View>
          <View style={styles.permissionChips}>
            {visible.length ? (
              visible.map((permission) => (
                <View key={permission.id} style={styles.permissionChip}>
                  <Text style={styles.permissionChipText}>
                    {formatLabel(permission.category)}:{" "}
                    {formatLabel(permission.permissionLevel)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.permissionChip}>
                <Text style={styles.permissionChipText}>
                  Nothing shared yet
                </Text>
              </View>
            )}
          </View>
        </AppCard>
      </Pressable>
    </AppSection>
  );
}

function CaregiverOverview({
  caregivers,
  onOpen,
}: {
  caregivers: CaregiverProfile[];
  onOpen: () => void;
}) {
  const { theme } = useAppTheme();
  const caregiver = caregivers.find((item) => item.isActive) ?? caregivers[0];
  return (
    <AppSection
      actionLabel="Manage"
      onActionPress={onOpen}
      subtitle="Caregivers remain contact cards, not switchable identities."
      title="Caregiver"
    >
      {caregiver ? (
        <AppCard style={[styles.caregiverCard, { borderColor: theme.border }]}>
          <View style={styles.caregiverTop}>
            <View style={styles.caregiverAvatar}>
              <AppIcon color={FAMILY} decorative name="caregiver" size={23} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {caregiver.name}
              </Text>
              <Text style={[styles.cardBody, { color: theme.mutedText }]}>
                {caregiver.relationship ?? caregiver.role ?? "Caregiver"} |{" "}
                {caregiver.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Caregiver</Text>
            </View>
          </View>
          <Text style={[styles.caregiverDetail, { color: theme.mutedText }]}>
            {caregiver.ratePerHour
              ? `$${caregiver.ratePerHour}/hour`
              : "Rate not added"}
            {caregiver.ratePerDay ? ` | $${caregiver.ratePerDay}/day` : ""}
            {caregiver.availableFrom || caregiver.availableTo
              ? ` | ${caregiver.availableFrom ?? ""}-${caregiver.availableTo ?? ""}`
              : ""}
          </Text>
          <View style={styles.contactRow}>
            <ContactButton
              disabled={!caregiver.phone}
              icon="voice"
              label="Call"
              onPress={() =>
                Linking.openURL(`tel:${caregiver.phone}`).catch(() => undefined)
              }
            />
            <ContactButton
              disabled={!caregiver.email}
              icon="shared"
              label="Email"
              onPress={() =>
                Linking.openURL(`mailto:${caregiver.email}`).catch(
                  () => undefined,
                )
              }
            />
          </View>
        </AppCard>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={[
            styles.emptyCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            No caregiver added
          </Text>
          <Text style={[styles.cardBody, { color: theme.mutedText }]}>
            Add a caregiver contact only when someone helps with care tasks.
          </Text>
        </Pressable>
      )}
    </AppSection>
  );
}

function ContactButton({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: "shared" | "voice";
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.contactButton, { opacity: disabled ? 0.45 : 1 }]}
    >
      <AppIcon color={FAMILY} decorative name={icon} size={17} />
      <Text style={styles.contactButtonText}>{label}</Text>
    </Pressable>
  );
}

function PendingInvites({
  invites,
  onOpen,
}: {
  invites: FamilyInvite[];
  onOpen: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      actionLabel="Open invites"
      onActionPress={onOpen}
      subtitle="Adults accept invitations before sharing begins."
      title="Pending invites and requests"
    >
      <AppCard style={[styles.inviteCard, { borderColor: theme.border }]}>
        <View style={styles.inviteIcon}>
          <AppIcon color="#7c3aed" decorative name="reminder" size={21} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {invites.length
              ? `${invites.length} pending invite${invites.length === 1 ? "" : "s"}`
              : "No pending invites"}
          </Text>
          <Text style={[styles.cardBody, { color: theme.mutedText }]}>
            {invites[0]
              ? `${invites[0].invitedEmail ?? invites[0].invitedPhone ?? "Invite"} | ${formatLabel(invites[0].role)}`
              : "New requests will appear here before access is granted."}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpen}>
          <Text style={styles.inviteAction}>Review</Text>
        </Pressable>
      </AppCard>
    </AppSection>
  );
}

function LinkedChildren({
  onOpen,
  profiles,
}: {
  onOpen: () => void;
  profiles: HealthProfile[];
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      actionLabel="Profiles"
      onActionPress={onOpen}
      subtitle="Parent-managed profiles remain linked to family care."
      title="Linked child profiles"
    >
      <View style={styles.childRow}>
        {profiles.length ? (
          profiles.slice(0, 3).map((profile) => (
            <Pressable
              accessibilityRole="button"
              key={profile.id}
              onPress={onOpen}
              style={[
                styles.childCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.childAvatar}>
                <AppIcon
                  color={FAMILY}
                  decorative
                  name="child_baby"
                  size={21}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.childName, { color: theme.text }]}
              >
                {profile.displayName}
              </Text>
              <Text style={[styles.childMeta, { color: theme.mutedText }]}>
                {formatLabel(profile.profileType)} |{" "}
                {profile.isManagedProfile ? "Managed" : "Independent"}
              </Text>
            </Pressable>
          ))
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onOpen}
            style={[
              styles.emptyCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              No linked child profiles
            </Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>
              Create or link child profiles from Family Profiles.
            </Text>
          </Pressable>
        )}
      </View>
    </AppSection>
  );
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  avatarStack: { alignItems: "center", flexDirection: "row" },
  cardBody: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: "900" },
  caregiverAvatar: {
    alignItems: "center",
    backgroundColor: FAMILY_SOFT,
    borderRadius: 18,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  caregiverCard: { borderWidth: 1, padding: 16 },
  caregiverDetail: { fontSize: 11, lineHeight: 17, marginTop: 12 },
  caregiverTop: { alignItems: "center", flexDirection: "row", gap: 11 },
  childAvatar: {
    alignItems: "center",
    backgroundColor: FAMILY_SOFT,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  childCard: {
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 132,
    padding: 13,
    width: "48%",
  },
  childMeta: { fontSize: 10, lineHeight: 15, marginTop: 4 },
  childName: { fontSize: 14, fontWeight: "900", marginTop: 9 },
  childRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  circleBadge: {
    alignSelf: "flex-start",
    backgroundColor: FAMILY_SOFT,
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  circleBadgeText: { color: "#854d0e", fontSize: 10, fontWeight: "900" },
  contactButton: {
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44,
  },
  contactButtonText: { color: "#854d0e", fontSize: 12, fontWeight: "900" },
  contactRow: { flexDirection: "row", gap: 8, marginTop: 13 },
  copy: { flex: 1 },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 15, width: "100%" },
  hero: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
  },
  heroBody: { fontSize: 13, lineHeight: 20, marginTop: 7 },
  heroCopy: { flex: 1 },
  heroGlow: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderRadius: 999,
    height: 190,
    position: "absolute",
    right: -78,
    top: -100,
    width: 190,
  },
  heroKicker: {
    color: FAMILY,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroStat: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    flex: 1,
    minHeight: 70,
    padding: 10,
  },
  heroStatLabel: {
    color: "#92400e",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  heroStats: { flexDirection: "row", gap: 8, marginTop: 17 },
  heroStatValue: { color: "#422006", fontSize: 18, fontWeight: "900" },
  heroTitle: { fontSize: 27, fontWeight: "900", lineHeight: 32, marginTop: 7 },
  heroTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  inviteAction: { color: "#7c3aed", fontSize: 12, fontWeight: "900" },
  inviteCard: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
  },
  inviteIcon: {
    alignItems: "center",
    backgroundColor: "#ede9fe",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  memberAvatar: {
    alignItems: "center",
    backgroundColor: FAMILY_SOFT,
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  memberAvatarText: { color: "#854d0e", fontSize: 14, fontWeight: "900" },
  memberCard: {
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    minHeight: 164,
    padding: 13,
  },
  memberGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  memberName: { fontSize: 14, fontWeight: "900", marginTop: 10 },
  memberStatus: { fontSize: 10, marginTop: 7 },
  permissionCard: { borderWidth: 1, padding: 16 },
  permissionChip: {
    backgroundColor: FAMILY_SOFT,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  permissionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
  },
  permissionChipText: { color: "#854d0e", fontSize: 10, fontWeight: "800" },
  permissionHeader: { alignItems: "center", flexDirection: "row", gap: 11 },
  permissionIcon: {
    alignItems: "center",
    backgroundColor: FAMILY_SOFT,
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: FAMILY_SOFT,
    borderRadius: 999,
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  roleBadgeText: { color: "#854d0e", fontSize: 10, fontWeight: "900" },
  stack: { gap: 24 },
  stackAvatar: {
    alignItems: "center",
    backgroundColor: FAMILY_SOFT,
    borderColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  stackAvatarText: { color: "#854d0e", fontSize: 12, fontWeight: "900" },
});
