import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function CalendarSyncSettingsScreen() {
  return (
    <SettingsDetailScreen
      note="Apple Calendar and Google Calendar sync are intentionally not connected yet."
      rows={[
        {
          icon: "calendar",
          label: "In-app calendar",
          status: "On",
          subtitle: "Calendar events stay inside the app for now.",
        },
        {
          icon: "sync",
          label: "Apple Calendar",
          status: "Later",
          subtitle: "External sync placeholder.",
        },
        {
          icon: "sync",
          label: "Google Calendar",
          status: "Later",
          subtitle: "External sync placeholder.",
        },
        {
          icon: "privacy",
          label: "Sensitive event sync",
          status: "Protected",
          subtitle: "Sensitive medical details should never sync as card text.",
        },
      ]}
      toggles={[
        {
          icon: "calendar",
          label: "Sync family events",
          subtitle: "Placeholder for future connected calendar sync.",
          value: false,
        },
        {
          icon: "caregiver",
          label: "Sync caregiver schedules",
          subtitle: "Only parent-approved caregiver windows should sync.",
          value: false,
        },
      ]}
      subtitle="Prepare connected calendar settings without syncing external calendars yet."
      title="Calendar sync"
    />
  );
}
