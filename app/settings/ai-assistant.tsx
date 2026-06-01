import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function AiAssistantSettingsScreen() {
  return (
    <SettingsDetailScreen
      note="OpenAI is not connected yet. Actions remain placeholder-only and should be audit logged when activated."
      rows={[
        { icon: "ai", label: "Safe summaries", status: "Required", subtitle: "Assistant responses should use safe summaries first." },
        { icon: "lock", label: "Action logging", status: "Audit", subtitle: "Every future AI action must be logged to audit history." },
        { icon: "privacy", label: "Sensitive response filter", status: "On", subtitle: "Sensitive data should be blocked from assistant responses." }
      ]}
      subtitle="Safe summaries first. OpenAI tools are not connected yet."
      title="AI assistant"
      toggles={[
        { icon: "ai", label: "Enable AI assistant", subtitle: "Allow the assistant entry points in the app.", value: true },
        { icon: "ai", label: "Floating assistant button", subtitle: "Show the small assistant button on main app screens.", value: true },
        { icon: "privacy", label: "Safe summaries only", subtitle: "Use safe previews and summaries before any protected detail.", value: true },
        { icon: "note", label: "Allow AI to create draft actions", subtitle: "Draft actions only. Nothing saves without review.", value: false },
        { icon: "shield", label: "Require confirmation before saving", subtitle: "Every future assistant action needs user confirmation.", value: true },
        { icon: "lock", label: "Block sensitive data from AI responses", subtitle: "Keep sensitive medical details out of generated responses.", value: true }
      ]}
    />
  );
}
