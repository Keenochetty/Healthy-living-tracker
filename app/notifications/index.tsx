import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  NativeEmptyState,
  NativeSkeletonCard,
  NotificationBadge,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  getNotificationColour,
  getSafePreview,
  listNotificationsForProfile,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications";
import { useProfileContext } from "@/lib/profile-context";

const placeholderNotifications: AppNotification[] = [
  {
    action_type: "open_app",
    child_id: null,
    created_at: new Date().toISOString(),
    family_id: null,
    full_message: "This sensitive detail should not show on the card.",
    id: "placeholder-orange-update",
    is_read: false,
    is_sensitive: true,
    recipient_profile_id: "placeholder",
    requires_action: true,
    safe_preview: "Open app to view details.",
    sender_profile_id: null,
    title: "Tommy has an important care update.",
    type: "orange_important_health",
  },
  {
    action_type: null,
    child_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    family_id: null,
    full_message: null,
    id: "placeholder-calendar",
    is_read: false,
    is_sensitive: false,
    recipient_profile_id: "placeholder",
    requires_action: false,
    safe_preview: "Soccer practice starts at 3:30 PM.",
    sender_profile_id: null,
    title: "Calendar reminder",
    type: "blue_calendar_activity",
  },
  {
    action_type: "review",
    child_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    family_id: null,
    full_message: null,
    id: "placeholder-attention",
    is_read: true,
    is_sensitive: false,
    recipient_profile_id: "placeholder",
    requires_action: true,
    safe_preview: "A family task needs a quick review.",
    sender_profile_id: null,
    title: "Attention needed",
    type: "yellow_attention",
  },
  {
    action_type: null,
    child_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    family_id: null,
    full_message: null,
    id: "placeholder-normal",
    is_read: true,
    is_sensitive: false,
    recipient_profile_id: "placeholder",
    requires_action: false,
    safe_preview: "Caregiver handoff summary was added.",
    sender_profile_id: null,
    title: "Normal update",
    type: "green_normal_update",
  },
  {
    action_type: null,
    child_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    family_id: null,
    full_message: null,
    id: "placeholder-ai",
    is_read: true,
    is_sensitive: false,
    recipient_profile_id: "placeholder",
    requires_action: false,
    safe_preview: "AI suggested a calendar buffer for tomorrow.",
    sender_profile_id: null,
    title: "AI suggestion",
    type: "purple_ai_suggestion",
  },
  {
    action_type: null,
    child_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    family_id: null,
    full_message: null,
    id: "placeholder-system",
    is_read: true,
    is_sensitive: false,
    recipient_profile_id: "placeholder",
    requires_action: false,
    safe_preview: "Sync completed successfully.",
    sender_profile_id: null,
    title: "System update",
    type: "grey_system",
  },
  {
    action_type: "emergency",
    child_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
    family_id: null,
    full_message:
      "Emergency details stay protected until opened intentionally.",
    id: "placeholder-emergency",
    is_read: true,
    is_sensitive: true,
    recipient_profile_id: "placeholder",
    requires_action: true,
    safe_preview: "Emergency contact information was updated.",
    sender_profile_id: null,
    title: "Emergency access update",
    type: "red_emergency",
  },
];

function formatNotificationType(type: AppNotification["type"]) {
  return type.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function NotificationsScreen() {
  const { profile } = useProfileContext();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unlockedNotificationIds, setUnlockedNotificationIds] = useState<
    Set<string>
  >(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const visibleNotifications =
    notifications.length > 0 ? notifications : placeholderNotifications;
  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const todayNotifications = visibleNotifications.filter((notification) =>
    isToday(notification.created_at),
  );
  const earlierNotifications = visibleNotifications.filter(
    (notification) => !isToday(notification.created_at),
  );

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextNotifications = await listNotificationsForProfile(profile?.id);
      setNotifications(nextNotifications);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadNotifications();
    }, 0);

    return () => {
      clearTimeout(loadTimer);
    };
  }, [loadNotifications]);

  async function handleMarkRead(notificationId: string) {
    setUpdatingId(notificationId);
    setErrorMessage(null);

    try {
      const updatedNotification = await markNotificationRead(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to mark notification read.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleSecurityCheck(notificationId: string) {
    setUnlockedNotificationIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(notificationId);
      return nextIds;
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <NotificationBadge
              count={unreadCount}
              type="blue_calendar_activity"
            />
          }
          eyebrow="Notifications"
          subtitle="Safe previews, clear actions, and protected details kept out of dashboard-style cards."
          title="Updates"
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <WidgetCard
          accentColor={colors.brand.primary}
          action={
            <StatusPill
              label={isLoading ? "Syncing" : "Current"}
              tone={isLoading ? "warning" : "success"}
            />
          }
          subtitle="Review family and care updates quickly."
          title="Notification center"
        >
          <View style={styles.summaryRow}>
            <StatusPill
              label={`${unreadCount} unread`}
              tone={unreadCount ? "warning" : "success"}
            />
            <StatusPill label={`${visibleNotifications.length} total`} />
            <QuickActionButton
              icon={
                <AppIcon color={colors.brand.primary} name="sync" size={20} />
              }
              label="Refresh"
              onPress={loadNotifications}
              toneColor={colors.brand.primary}
            />
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          subtitle="Grouped cards use safe previews only."
          title="Today"
        >
          {isLoading ? <NativeSkeletonCard /> : null}
          {!isLoading && todayNotifications.length === 0 ? (
            <NativeEmptyState
              icon="notifications"
              title="No notifications today"
              message="You are caught up. New family and care updates will appear here with safe previews."
            />
          ) : null}

          <View style={styles.list}>
            {todayNotifications.map((notification) => {
              const colour = getNotificationColour(notification.type);

              return (
                <View
                  key={notification.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colour.backgroundColor,
                      borderColor: colour.borderColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.colorStripe,
                      { backgroundColor: colour.accentColor },
                    ]}
                  />
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconShell,
                        { backgroundColor: colors.card.background },
                      ]}
                    >
                      <AppIcon
                        color={colour.accentColor}
                        name="notifications"
                        size={22}
                      />
                    </View>
                    <View style={styles.copy}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { color: colour.textColor },
                        ]}
                      >
                        {notification.title}
                      </Text>
                      <Text style={styles.safePreview}>
                        {getSafePreview(notification)}
                      </Text>
                      {notification.is_sensitive ? (
                        <Text style={styles.protectedText}>
                          Sensitive notification: safe preview only.
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.badgeStack}>
                      <StatusPill
                        label={notification.is_read ? "Read" : "Unread"}
                        tone={notification.is_read ? "default" : "warning"}
                      />
                      {notification.requires_action ? (
                        <StatusPill label="Action required" tone="warning" />
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>
                      {formatNotificationType(notification.type)}
                    </Text>
                    <Text style={styles.meta}>
                      {formatDate(notification.created_at)}
                    </Text>
                  </View>

                  {notification.is_sensitive &&
                  !unlockedNotificationIds.has(notification.id) ? (
                    <QuickActionButton
                      label="Open app to view details"
                      onPress={() => handleSecurityCheck(notification.id)}
                      toneColor={colors.status.system}
                    />
                  ) : null}

                  {!notification.is_read ? (
                    updatingId === notification.id ? (
                      <ActivityIndicator />
                    ) : (
                      <QuickActionButton
                        label="Mark read"
                        onPress={() => handleMarkRead(notification.id)}
                        toneColor={colors.status.success}
                      />
                    )
                  ) : null}
                </View>
              );
            })}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.system}
          subtitle="Older updates remain scannable and privacy-safe."
          title="Earlier"
        >
          {earlierNotifications.length === 0 ? (
            <NativeEmptyState
              icon="notifications"
              title="No earlier updates"
              message="Older notifications will stay grouped here when they arrive."
            />
          ) : null}

          <View style={styles.list}>
            {earlierNotifications.map((notification) => {
              const colour = getNotificationColour(notification.type);

              return (
                <View
                  key={notification.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colour.backgroundColor,
                      borderColor: colour.borderColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.colorStripe,
                      { backgroundColor: colour.accentColor },
                    ]}
                  />
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconShell,
                        { backgroundColor: colors.card.background },
                      ]}
                    >
                      <AppIcon
                        color={colour.accentColor}
                        name="notifications"
                        size={22}
                      />
                    </View>
                    <View style={styles.copy}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { color: colour.textColor },
                        ]}
                      >
                        {notification.title}
                      </Text>
                      <Text style={styles.safePreview}>
                        {getSafePreview(notification)}
                      </Text>
                      {notification.is_sensitive ? (
                        <Text style={styles.protectedText}>
                          Sensitive notification: safe preview only.
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.badgeStack}>
                      <StatusPill
                        label={notification.is_read ? "Read" : "Unread"}
                        tone={notification.is_read ? "default" : "warning"}
                      />
                      {notification.requires_action ? (
                        <StatusPill label="Action required" tone="warning" />
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>
                      {formatNotificationType(notification.type)}
                    </Text>
                    <Text style={styles.meta}>
                      {formatDate(notification.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeStack: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  colorStripe: {
    borderRadius: 999,
    height: 5,
    width: 54,
  },
  error: {
    color: colors.status.emergency,
    fontSize: 15,
    fontWeight: "800",
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  list: {
    gap: spacing.md,
  },
  meta: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  protectedText: {
    color: colors.text.secondary,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  safePreview: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  sensitiveBlock: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
