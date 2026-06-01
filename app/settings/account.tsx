import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function AccountSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        { icon: "lock", label: "Email and sign-in", status: "Auth", subtitle: "Supabase Auth account details will appear here." },
        { icon: "profiles", label: "Account status", status: "Active", subtitle: "Subscription and account state placeholders." },
        { icon: "privacy", label: "Data export", status: "Later", subtitle: "Downloadable account data will be added after backend wiring." },
        { icon: "shield", label: "Delete account", status: "Later", subtitle: "Destructive account actions are not connected yet." }
      ]}
      subtitle="Manage sign-in, email, and account basics."
      title="Account details"
    />
  );
}
