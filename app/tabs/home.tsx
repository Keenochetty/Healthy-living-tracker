import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  BottomSheet,
  EmergencyButton,
  NotificationBadge,
  QuickActionButton,
  StatusSurface,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { layout } from "@/constants/layout";
import { spacing } from "@/constants/spacing";
import { colors, shadows } from "@/constants/theme";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";

type DashboardWidget = {
  accentColor: string;
  detail: string;
  id: string;
  metric: string;
  route?: string;
  subtitle: string;
  title: string;
  tone?: "ai" | "default" | "emergency" | "success" | "warning";
};

type QuickAction = {
  label: string;
  route?: string;
  toneColor: string;
};

const dashboardWidgets: DashboardWidget[] = [
  {
    accentColor: colors.brand.primary,
    detail:
      "A quick view of care routines, handoffs, and family-safe updates for today.",
    id: "todays-care",
    metric: "3 items",
    route: "/tabs/profiles",
    subtitle: "Routines and check-ins",
    title: "Today's Care",
    tone: "success",
  },
  {
    accentColor: colors.accent.sky,
    detail:
      "Appointments, school events, sport activities, and routine approvals.",
    id: "calendar",
    metric: "Next 3:30",
    route: "/tabs/calendar",
    subtitle: "Schedule at a glance",
    title: "Calendar",
  },
  {
    accentColor: colors.status.warning,
    detail:
      "Medication reminders only. Full medication details stay protected behind app security.",
    id: "medication",
    metric: "0 due",
    route: "/health/medication",
    subtitle: "Reminders and doses",
    title: "Medication",
    tone: "warning",
  },
  {
    accentColor: colors.status.emergency,
    detail:
      "Emergency actions should stay large, clear, and protected by audit logging.",
    id: "emergency",
    metric: "Ready",
    route: "/settings/emergency-contacts",
    subtitle: "Fast access when needed",
    title: "Emergency",
    tone: "emergency",
  },
];

const optionalWidgets: DashboardWidget[] = [
  {
    accentColor: colors.status.system,
    detail: "Private documents and protected health file access.",
    id: "documents",
    metric: "Secure",
    route: "/health/documents",
    subtitle: "Protected files",
    title: "Documents",
  },
  {
    accentColor: colors.status.ai,
    detail: "AI suggestions use safe summaries only.",
    id: "ai-suggestions",
    metric: "3 ideas",
    route: "/assistant",
    subtitle: "Safe suggestions",
    title: "AI Suggestions",
    tone: "ai",
  },
  {
    accentColor: colors.brand.secondary,
    detail: "Birthdays and family milestones can be imported later.",
    id: "birthdays",
    metric: "Import",
    route: "/tabs/calendar",
    subtitle: "Family dates",
    title: "Birthdays",
  },
];

const quickActions: QuickAction[] = [
  {
    label: "Add event",
    route: "/tabs/calendar",
    toneColor: colors.brand.primary,
  },
  {
    label: "Log activity",
    route: "/tabs/profiles",
    toneColor: colors.status.success,
  },
  {
    label: "Add medication",
    route: "/health/medication",
    toneColor: colors.status.warning,
  },
];

function getProfileName(
  profile: ReturnType<typeof useProfileContext>["profile"],
) {
  return profile?.display_name || profile?.full_name || "Keeno";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getFamilyDisplayName(circleName: string, memberNames: string[]) {
  const firstMember = memberNames[0];
  const surname = firstMember?.trim().split(/\s+/).at(-1);

  return surname && surname.length > 1 ? `${surname} Family` : circleName;
}

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function HomeScreen() {
  const {
    errorMessage,
    families,
    isLoading,
    profile,
    refreshProfileContext,
    selectedFamily,
    switchFamily,
    switchMode,
  } = useProfileContext();
  const { width } = useWindowDimensions();
  const [activeWidget, setActiveWidget] = useState<DashboardWidget | null>(
    null,
  );
  const [activeUpdate, setActiveUpdate] = useState<{
    id: string;
    title: string;
    detail: string;
  } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [updateNotes, setUpdateNotes] = useState<Record<string, string[]>>({});
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [visibleWidgetIds, setVisibleWidgetIds] = useState(() =>
    dashboardWidgets.map((widget) => widget.id),
  );
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const dashboardEntrance = useRef(new Animated.Value(0)).current;

  const profileName = getProfileName(profile);
  const greeting = useMemo(() => getGreeting(), []);
  const todayLabel = useMemo(() => getTodayLabel(), []);
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const selectedCircle =
    circles.find((circle) => circle.id === selectedFamily?.id) ??
    circles[0] ??
    null;
  const familyDisplayName = selectedCircle
    ? getFamilyDisplayName(
        selectedCircle.name,
        selectedCircle.members.map((member) => member.displayName),
      )
    : "Family Circle";
  const extraProfiles = selectedCircle
    ? [
        ...selectedCircle.careProfiles.map((careProfile) => ({
          id: careProfile.id,
          label: careProfile.displayName,
          meta: `${careProfile.profileType.replaceAll("_", " ")} - shared info only`,
          route: `/care-profiles/${careProfile.id}`,
          tone: colors.status.ai,
        })),
        ...selectedCircle.members
          .filter(
            (member) => member.role !== "caregiver" && member.role !== "owner",
          )
          .map((member) => ({
            id: member.id,
            label: member.displayName,
            meta: `${member.relationship.replaceAll("_", " ")} - shared circle info`,
            route: selectedCircle
              ? `/circles/${selectedCircle.id}`
              : "/circles",
            tone: colors.status.success,
          })),
      ]
    : [];
  const profileCarouselItems = [
    {
      id: "me",
      label: "Me",
      meta: "Private by default",
      route: "/settings/profile",
      tone: colors.brand.primary,
    },
    {
      id: "circle",
      label: familyDisplayName,
      meta: "Selected Family/Care Circle",
      route: selectedCircle ? `/circles/${selectedCircle.id}` : "/circles",
      tone: colors.status.success,
    },
    ...extraProfiles,
  ];
  const todayUpdates = [
    {
      id: "doctor-note",
      title: "Doctor visit",
      detail: "Send a supportive note for the appointment.",
      route: "/tabs/calendar",
      tone: colors.status.warning,
    },
    {
      id: "soccer-game",
      title: "Soccer game",
      detail: "Share encouragement before the match.",
      route: "/tabs/calendar",
      tone: colors.accent.sky,
    },
    {
      id: "care-handoff",
      title: "Care handoff",
      detail: "Safe caregiver update ready in Profiles.",
      route: "/tabs/profiles",
      tone: colors.status.success,
    },
  ];
  const allWidgets = [...dashboardWidgets, ...optionalWidgets];
  const visibleWidgets = allWidgets.filter((widget) =>
    visibleWidgetIds.includes(widget.id),
  );
  const gridItemWidth =
    width >= layout.breakpoints.desktop
      ? "31%"
      : width >= layout.breakpoints.tablet
        ? "47%"
        : "100%";

  useEffect(() => {
    Animated.timing(dashboardEntrance, {
      duration: 360,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [dashboardEntrance]);

  function handleWidgetPress(widget: DashboardWidget) {
    if (widget.route) {
      openRoute(widget.route);
      return;
    }

    setActiveWidget(widget);
  }

  async function handleCircleSelect(circleId: string) {
    const circle = circles.find((item) => item.id === circleId);

    if (!circle || circle.source === "placeholder") {
      openRoute(`/circles/${circleId}`);
      return;
    }

    setIsSwitchingMode(true);

    try {
      await switchFamily(circleId);
      await switchMode("family");
    } finally {
      setIsSwitchingMode(false);
    }
  }

  function handleQuickAction(action: QuickAction) {
    if (action.route) {
      openRoute(action.route);
      return;
    }

    setPlaceholderMessage(
      `${action.label} will open a quick action drawer next.`,
    );
  }

  function toggleWidget(widgetId: string) {
    setVisibleWidgetIds((current) =>
      current.includes(widgetId)
        ? current.filter((item) => item !== widgetId)
        : [...current, widgetId],
    );
  }

  function addUpdateNote() {
    const note = noteText.trim();

    if (!activeUpdate || !note) {
      return;
    }

    setUpdateNotes((current) => ({
      ...current,
      [activeUpdate.id]: [...(current[activeUpdate.id] ?? []), note],
    }));
    setNoteText("");
  }

  if (isLoading) {
    return (
      <AppScreen scroll={false} style={styles.loadingScreen}>
        <ActivityIndicator />
      </AppScreen>
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <View style={styles.headerShell}>
          <AppHeader
            action={
              <Pressable
                accessibilityRole="button"
                onPress={() => openRoute("/notifications")}
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  color={colors.text.primary}
                  name="notifications"
                  size={23}
                />
                <View style={styles.notificationDot} />
              </Pressable>
            }
            eyebrow={todayLabel}
            subtitle={`${familyDisplayName} - safe summaries only`}
            title={`${greeting}, ${profileName}`}
          />
        </View>

        <StatusSurface
          action={<StatusPill label="Safe" tone="success" />}
          description="No urgent alerts. Home only shows shared updates and protected summaries."
          icon="shield"
          title="Today is steady"
          tone="connected"
        />

        <WidgetCard
          accentColor={colors.status.success}
          action={
            <QuickActionButton
              label="Manage"
              onPress={() =>
                openRoute(
                  selectedCircle ? `/circles/${selectedCircle.id}` : "/circles",
                )
              }
              toneColor={colors.status.success}
            />
          }
          subtitle="Family icon and photo upload are placeholders for setup."
          title={familyDisplayName}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {circles.map((circle) => (
              <Pressable
                accessibilityRole="button"
                key={circle.id}
                onPress={() => handleCircleSelect(circle.id)}
                style={({ pressed }) => [
                  styles.circleMiniCard,
                  selectedCircle?.id === circle.id &&
                    styles.circleMiniCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.familyAvatar}>
                  <AppIcon
                    color={colors.status.success}
                    name={
                      circle.kind === "care_circle" ? "caregiver" : "family"
                    }
                    size={24}
                  />
                </View>
                <Text style={styles.carouselTitle}>
                  {getFamilyDisplayName(
                    circle.name,
                    circle.members.map((member) => member.displayName),
                  )}
                </Text>
                <Text style={styles.carouselMeta}>
                  {circle.kind === "care_circle"
                    ? "Care Circle"
                    : "Family Circle"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </WidgetCard>

        {profileCarouselItems.length > 2 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile view</Text>
              {isSwitchingMode ? (
                <ActivityIndicator />
              ) : (
                <StatusPill label="Shared only" />
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {profileCarouselItems.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => openRoute(item.route)}
                  style={({ pressed }) => [
                    styles.profileMiniCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.familyAvatar,
                      { backgroundColor: `${item.tone}20` },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: item.tone }]}>
                      {item.label.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.carouselTitle}>{item.label}</Text>
                  <Text style={styles.carouselMeta}>{item.meta}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <QuickActionButton
              label="Retry profile refresh"
              onPress={refreshProfileContext}
              toneColor={colors.status.emergency}
            />
          </View>
        ) : null}

        <WidgetCard accentColor={colors.brand.primary} style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.todayEyebrow}>Today updates</Text>
              <Text style={styles.todayTitle}>
                Notes, events, and care updates
              </Text>
            </View>
            <StatusPill label="Calm" tone="success" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {todayUpdates.map((update) => (
              <Pressable
                accessibilityRole="button"
                key={update.id}
                onPress={() => setActiveUpdate(update)}
                style={({ pressed }) => [
                  styles.updateCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.dot, { backgroundColor: update.tone }]} />
                <Text style={styles.carouselTitle}>{update.title}</Text>
                <Text style={styles.carouselMeta}>{update.detail}</Text>
                <StatusPill
                  label={`${updateNotes[update.id]?.length ?? 0} notes`}
                />
              </Pressable>
            ))}
          </ScrollView>
        </WidgetCard>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <StatusPill label="Safe summaries" />
          </View>
          <View style={styles.previewGrid}>
            <WidgetCard
              accentColor={colors.status.ai}
              action={
                <NotificationBadge
                  label="2 updates"
                  type="purple_ai_suggestion"
                />
              }
              onPress={() => openRoute("/tabs/care")}
              subtitle="Care Circle preview"
              title="Health monitor"
            >
              <Text style={styles.previewText}>
                Health reminders and protected summaries are ready in Health
                Monitor. Caregiver work is under Profiles.
              </Text>
            </WidgetCard>
            <WidgetCard
              accentColor={colors.accent.sky}
              action={
                <NotificationBadge
                  label="Today"
                  type="blue_calendar_activity"
                />
              }
              onPress={() => openRoute("/tabs/calendar")}
              subtitle="Calendar preview"
              title="Today on the calendar"
            >
              <Text style={styles.previewText}>
                Soccer practice, a medication reminder, and one family event are
                queued for today.
              </Text>
            </WidgetCard>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today widgets</Text>
            <QuickActionButton
              label="Customize"
              onPress={() => setIsCustomizeOpen(true)}
              toneColor={colors.status.ai}
            />
          </View>
          <View style={styles.grid}>
            {visibleWidgets.map((widget) => (
              <Animated.View
                key={widget.id}
                style={[
                  styles.gridItem,
                  {
                    opacity: dashboardEntrance,
                    transform: [
                      {
                        translateY: dashboardEntrance.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                    width: gridItemWidth,
                  },
                ]}
              >
                <WidgetCard
                  accentColor={widget.accentColor}
                  onPress={() => handleWidgetPress(widget)}
                  subtitle={widget.subtitle}
                  title={widget.title}
                >
                  <View style={styles.widgetBody}>
                    <Text style={styles.metric}>{widget.metric}</Text>
                    <StatusPill
                      label={widget.tone === "emergency" ? "Important" : "Open"}
                      tone={widget.tone ?? "default"}
                    />
                  </View>
                </WidgetCard>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <StatusPill label="No reloads" />
          </View>
          <View style={styles.quickActionGrid}>
            {quickActions.map((action) => (
              <QuickActionButton
                key={action.label}
                label={action.label}
                onPress={() => handleQuickAction(action)}
                toneColor={action.toneColor}
              />
            ))}
          </View>
        </View>

        <BottomSheet
          footer={
            activeWidget?.id === "emergency" ? (
              <EmergencyButton
                label="Open emergency actions"
                onPress={() => openRoute("/settings/emergency-contacts")}
              />
            ) : null
          }
          onClose={() => setActiveWidget(null)}
          title={activeWidget?.title}
          visible={Boolean(activeWidget)}
        >
          {activeWidget ? (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetMetric}>{activeWidget.metric}</Text>
              <Text style={styles.sheetText}>{activeWidget.detail}</Text>
            </View>
          ) : null}
        </BottomSheet>

        <BottomSheet
          onClose={() => setIsCustomizeOpen(false)}
          title="Customize Home"
          visible={isCustomizeOpen}
        >
          <View style={styles.customizeList}>
            {allWidgets.map((widget) => {
              const enabled = visibleWidgetIds.includes(widget.id);

              return (
                <Pressable
                  accessibilityRole="button"
                  key={widget.id}
                  onPress={() => toggleWidget(widget.id)}
                  style={({ pressed }) => [
                    styles.customizeRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: widget.accentColor },
                    ]}
                  />
                  <View style={styles.customizeCopy}>
                    <Text style={styles.carouselTitle}>{widget.title}</Text>
                    <Text style={styles.carouselMeta}>{widget.subtitle}</Text>
                  </View>
                  <StatusPill
                    label={enabled ? "Shown" : "Hidden"}
                    tone={enabled ? "success" : "default"}
                  />
                </Pressable>
              );
            })}
          </View>
        </BottomSheet>

        <BottomSheet
          footer={
            <QuickActionButton
              label="Add note"
              onPress={addUpdateNote}
              toneColor={colors.brand.primary}
            />
          }
          onClose={() => {
            setActiveUpdate(null);
            setNoteText("");
          }}
          title={activeUpdate?.title}
          visible={Boolean(activeUpdate)}
        >
          {activeUpdate ? (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetText}>{activeUpdate.detail}</Text>
              <TextInput
                multiline
                onChangeText={setNoteText}
                placeholder="Add an optional family note"
                placeholderTextColor={colors.text.muted}
                style={styles.noteInput}
                value={noteText}
              />
              {(updateNotes[activeUpdate.id] ?? []).map((note) => (
                <View key={note} style={styles.noteRow}>
                  <AppIcon
                    color={colors.status.success}
                    name="note"
                    size={18}
                  />
                  <Text style={styles.previewText}>{note}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </BottomSheet>

        <Modal
          transparent
          visible={Boolean(placeholderMessage)}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPlaceholderMessage(null)}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Coming next</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton
                label="Close"
                onPress={() => setPlaceholderMessage(null)}
                toneColor={colors.brand.primary}
              />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarText: {
    fontSize: 18,
    fontWeight: "900",
  },
  carouselContent: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  carouselMeta: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  carouselTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  circleMiniCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 118,
    padding: spacing.md,
    width: 172,
  },
  circleMiniCardActive: {
    backgroundColor: colors.status.successSoft,
    borderColor: colors.status.success,
  },
  customizeCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  customizeList: {
    gap: spacing.md,
  },
  customizeRow: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  dot: {
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  errorPanel: {
    backgroundColor: colors.status.emergencySoft,
    borderColor: "#FDA4AF",
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  errorText: {
    color: colors.status.emergency,
    fontSize: 14,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: {
    minWidth: 0,
  },
  headerShell: {
    gap: spacing.md,
  },
  familyAvatar: {
    alignItems: "center",
    backgroundColor: colors.status.successSoft,
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  loadingScreen: {
    alignItems: "center",
    justifyContent: "center",
  },
  metric: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%",
    ...shadows.card,
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  notificationButton: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
    ...shadows.soft,
  },
  notificationDot: {
    backgroundColor: colors.accent.coral,
    borderRadius: 999,
    height: 9,
    position: "absolute",
    right: 12,
    top: 11,
    width: 9,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  previewGrid: {
    gap: spacing.md,
  },
  previewText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  quickActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  noteInput: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 15,
    minHeight: 96,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  noteRow: {
    alignItems: "flex-start",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  profileMiniCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 126,
    padding: spacing.md,
    width: 176,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  sheetContent: {
    gap: spacing.lg,
  },
  sheetMetric: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  sheetText: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 23,
  },
  todayCard: {
    backgroundColor: colors.background.warm,
  },
  todayEyebrow: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  todayHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  todayItem: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minWidth: 150,
    padding: spacing.md,
  },
  todayLabel: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  todayRows: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  updateCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 120,
    padding: spacing.md,
    width: 204,
  },
  todayTitle: {
    color: colors.text.primary,
    fontSize: 19,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  todayValue: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  widgetBody: {
    alignItems: "flex-start",
    gap: spacing.sm,
  },
});
