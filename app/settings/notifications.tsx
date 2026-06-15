import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function NotificationSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        {
          icon: "notifications",
          label: "Notification colours",
          subtitle:
            "Green, blue, yellow, orange, red, purple, and grey meanings.",
        },
        {
          icon: "privacy",
          label: "Sensitive notifications",
          status: "Safe preview",
          subtitle: "Sensitive details stay locked behind a future check.",
        },
        {
          icon: "emergency",
          label: "Emergency notifications",
          status: "Visible",
          subtitle:
            "Emergency access remains easy to find without red-heavy screens.",
        },
      ]}
      subtitle="Control safe previews, alert categories, and in-app notification behavior."
      title="Notifications"
      toggles={[
        {
          icon: "notifications",
          label: "Show safe previews",
          subtitle:
            "Always show the safe preview before full notification detail.",
          value: true,
        },
        {
          icon: "lock",
          label: "Lock sensitive notifications",
          subtitle: "Require security check before sensitive details.",
          value: true,
        },
        {
          icon: "activity",
          label: "Action required badges",
          subtitle: "Show clear badges when family action is needed.",
          value: true,
        },
      ]}
    />
  );
}
