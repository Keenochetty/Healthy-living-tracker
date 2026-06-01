import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function VoiceAssistantSettingsScreen() {
  return (
    <SettingsDetailScreen
      note="Voice controls are placeholder-only until device permissions and command handling are connected."
      rows={[
        { icon: "voice", label: "Voice status", status: "Placeholder", subtitle: "Voice assistant controls are staged but not active yet." },
        { icon: "privacy", label: "Private by default", subtitle: "Voice should use safe summaries and avoid sensitive spoken details." },
        { icon: "ai", label: "Assistant handoff", subtitle: "Future voice requests can hand off to the AI assistant after confirmation." }
      ]}
      subtitle="Hands-free controls for families and caregivers, designed to stay private and calm."
      title="Voice assistant"
      toggles={[
        { icon: "voice", label: "Enable voice assistant", subtitle: "Placeholder toggle for future voice input.", value: false },
        { icon: "shield", label: "Require confirmation", subtitle: "Confirm before any voice action saves or shares information.", value: true },
        { icon: "lock", label: "Block sensitive spoken previews", subtitle: "Avoid reading sensitive medical details aloud.", value: true }
      ]}
    />
  );
}
