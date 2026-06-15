import { Bell, Plus, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  AppAlertCard,
  AppAvatar,
  AppButton,
  AppCard,
  AppChip,
  AppEmptyState,
  AppFloatingActionButton,
  AppFormInput,
  AppHeader,
  AppIcon,
  AppIconButton,
  AppProgressCard,
  AppScreen,
  AppSection,
  AppStatusPill,
  AppToggleRow,
  AppWidgetCard,
} from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function UiKitScreen() {
  const { theme } = useAppTheme();
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);

  return (
    <AppScreen>
      <AppHeader
        avatarInitials="HL"
        showNotificationIcon
        subtitle="Design system"
        title="UI Kit"
      />

      <AppSection title="Buttons">
        <View style={{ gap: 10 }}>
          <AppButton
            iconLeft={<Plus color="#ffffff" size={18} />}
            title="Primary"
          />
          <AppButton title="Secondary" variant="secondary" />
          <AppButton title="Outline" variant="outline" />
          <AppButton title="Ghost" variant="ghost" />
          <AppButton title="Success" variant="success" />
          <AppButton title="Danger" variant="danger" />
        </View>
      </AppSection>

      <AppSection title="Chips and status">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <AppChip
            icon={<AppIcon name="water" size={15} variant="primary" />}
            label="Water"
            selected
            variant="primary"
          />
          <AppChip label="Private" variant="private" />
          <AppChip label="Warning" variant="warning" />
          <AppChip label="Success" variant="success" />
          <AppStatusPill status="scheduled" />
          <AppStatusPill label="Synced" status="synced" />
        </View>
      </AppSection>

      <AppSection title="Cards">
        <AppCard>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
            Default card
          </Text>
          <Text style={{ color: theme.mutedText, marginTop: 6 }}>
            Calm surfaces, rounded corners, and soft shadows.
          </Text>
        </AppCard>
        <AppAlertCard
          icon={<AppIcon name="health" size={20} variant="warning" />}
          message="Use alert cards for AI, health, privacy, and safety notes."
          title="Health note"
          variant="medical"
        />
        <AppProgressCard
          helper="A compact progress card for water, goals, or onboarding."
          iconName="water"
          max={8}
          title="Water"
          value={4}
        />
      </AppSection>

      <AppSection title="Widgets">
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <AppWidgetCard
            helper="good recovery"
            iconName="sleep"
            title="Sleep"
            value="7h 25m"
            variant="purple"
          />
          <AppWidgetCard
            helper="2 meals logged"
            iconName="food"
            title="Food"
            value="820 kcal"
            variant="green"
          />
          <AppWidgetCard
            helper="review drafts"
            iconName="ai_assistant"
            title="AI helper"
            value="Ready"
            variant="blue"
          />
          <AppWidgetCard
            helper="check-in"
            iconName="mood"
            title="Mind"
            value="Calm"
            variant="pink"
          />
        </View>
      </AppSection>

      <AppSection title="Inputs and toggles">
        <AppFormInput
          helperText="Shared input styling for forms."
          label="Display name"
          onChangeText={setName}
          placeholder="Your name"
          value={name}
        />
        <AppToggleRow
          description="Use this pattern for modules, permissions, settings, and notifications."
          onValueChange={setEnabled}
          title="Helpful reminders"
          value={enabled}
        />
      </AppSection>

      <AppSection title="Avatars and actions">
        <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
          <AppAvatar initials="AK" size={48} status="okay" />
          <AppAvatar initials="BB" size={48} status="scheduled" />
          <AppIconButton icon={<Bell size={20} />} onPress={() => undefined} />
          <AppFloatingActionButton
            icon={<Sparkles size={20} />}
            label="Ask AI"
            onPress={() => undefined}
          />
        </View>
      </AppSection>

      <AppEmptyState
        actionLabel="Add reminder"
        description="Your day is clear. Add something only when it helps."
        emoji="🌿"
        onActionPress={() => undefined}
        title="Nothing scheduled"
      />
    </AppScreen>
  );
}
