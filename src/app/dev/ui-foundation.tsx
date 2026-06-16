import { Bell, ChevronRight, HeartPulse, Plus, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { NativeSettingsPreview } from "@/components/native-ios/NativeSettingsPreview";
import {
  AppAvatar,
  AppBadge,
  AppButton,
  AppCard,
  AppIconButton,
  AppInput,
  AppScreen,
  AppSectionHeader,
  AppSwitch,
  AppText,
} from "@/components/ui-native";
import { getContrastText } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function UiFoundationScreen() {
  const { theme } = useAppTheme();
  const [name, setName] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  return (
    <AppScreen>
      <View className="gap-2">
        <AppText variant="display">HealthSync</AppText>
        <AppText variant="bodyMuted">
          A calm, reusable HeroUI Native foundation for future mobile screens.
        </AppText>
      </View>

      <AppCard className="gap-4" variant="elevated">
        <AppSectionHeader
          actionLabel="View all"
          onActionPress={() => undefined}
          subtitle="Clear hierarchy for reusable sections"
          title="Today"
        />
        <View className="gap-2">
          <AppText variant="title">Daily health</AppText>
          <AppText variant="subtitle">A steady start</AppText>
          <AppText variant="body">
            Your shared components remain readable on small phones and centered
            on larger screens.
          </AppText>
          <AppText variant="bodyMuted">Muted supporting information</AppText>
          <AppText variant="caption">Updated a few moments ago</AppText>
          <AppText variant="label">HEALTH STATUS</AppText>
          <AppText variant="success">All checks look good</AppText>
          <AppText variant="danger">Example attention message</AppText>
        </View>
      </AppCard>

      <View className="gap-3">
        <AppSectionHeader title="Buttons" />
        <AppButton
          fullWidth
          leftIcon={<HeartPulse color={getContrastText(theme.primary)} size={18} />}
          onPress={() => undefined}
          variant="primary"
        >
          Primary action
        </AppButton>
        <AppButton
          fullWidth
          onPress={() => undefined}
          rightIcon={<ChevronRight color={theme.text} size={18} />}
          variant="secondary"
        >
          Secondary action
        </AppButton>
        <View className="flex-row flex-wrap gap-3">
          <AppButton onPress={() => undefined} size="sm" variant="soft">
            Soft
          </AppButton>
          <AppButton onPress={() => undefined} size="sm" variant="ghost">
            Ghost
          </AppButton>
          <AppButton onPress={() => undefined} size="sm" variant="danger">
            Danger
          </AppButton>
          <AppButton loading onPress={() => undefined} size="sm">
            Loading
          </AppButton>
        </View>
      </View>

      <AppCard className="gap-5">
        <AppSectionHeader
          subtitle="Inputs and settings rows"
          title="Daily settings"
        />
        <AppInput
          helperText="Shown only inside this dev foundation route."
          label="Display name"
          onChangeText={setName}
          placeholder="Your name"
          value={name}
        />
        <AppSwitch
          description="You stay in control of every reminder."
          isSelected={remindersEnabled}
          label="Helpful reminders"
          onSelectedChange={setRemindersEnabled}
        />
      </AppCard>

      <View className="gap-3">
        <AppSectionHeader title="Status badges" />
        <View className="flex-row flex-wrap gap-2">
          <AppBadge>Neutral</AppBadge>
          <AppBadge variant="success">Success</AppBadge>
          <AppBadge variant="warning">Warning</AppBadge>
          <AppBadge variant="danger">Danger</AppBadge>
          <AppBadge variant="info">Info</AppBadge>
          <AppBadge variant="private">Private</AppBadge>
          <AppBadge variant="ai">AI draft</AppBadge>
        </View>
      </View>

      <View className="gap-3">
        <AppSectionHeader title="People and actions" />
        <View className="flex-row flex-wrap items-center gap-4">
          <AppAvatar initials="AK" size="lg" status="online" />
          <AppAvatar initials="BB" size="md" status="away" />
          <AppAvatar initials="CS" size="sm" status="busy" />
          <AppIconButton
            accessibilityLabel="Notifications"
            icon={<Bell color={theme.text} size={20} />}
            onPress={() => undefined}
          />
          <AppIconButton
            accessibilityLabel="Add health entry"
            icon={<Plus color={theme.primary} size={20} />}
            onPress={() => undefined}
            shape="square"
            variant="soft"
          />
          <AppIconButton
            accessibilityLabel="Open AI assistant"
            icon={<Sparkles color={getContrastText(theme.primary)} size={20} />}
            onPress={() => undefined}
            variant="primary"
          />
        </View>
      </View>

      <AppCard disabled variant="compact">
        <AppText variant="label">Disabled compact card</AppText>
        <AppText variant="caption">
          Pressable, compact, and elevated card variants share one visual base.
        </AppText>
      </AppCard>

      <NativeSettingsPreview />
    </AppScreen>
  );
}
