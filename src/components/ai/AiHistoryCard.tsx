import { View } from "react-native";

import { AppBadge, AppButton, AppCard, AppText } from "@/components/ui-native";
import { getAiImportTargetLabel } from "@/features/ai/aiImportRouting";
import type { HealthSyncAiSession } from "@/features/ai/types";

type AiHistoryCardProps = {
  onDelete?: () => void;
  onDismiss?: () => void;
  onImport?: () => void;
  onView?: () => void;
  session: HealthSyncAiSession;
};

export function AiHistoryCard({
  onDelete,
  onDismiss,
  onImport,
  onView,
  session,
}: AiHistoryCardProps) {
  const sourceLabel =
    session.source === "chatgpt_user_account"
      ? "ChatGPT"
      : session.source === "manual_paste"
        ? "Manual"
        : "Local";

  return (
    <AppCard className="gap-3" variant="compact">
      <View className="flex-row flex-wrap items-center gap-2">
        <AppBadge variant={session.status === "imported" ? "success" : "ai"}>
          {session.status}
        </AppBadge>
        <AppBadge>{session.result_type.replaceAll("_", " ")}</AppBadge>
        <AppBadge variant="info">{sourceLabel}</AppBadge>
      </View>
      <View className="gap-1">
        <AppText variant="label">{session.title}</AppText>
        <AppText variant="caption">
          {new Date(session.created_at).toLocaleDateString()}
        </AppText>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {session.import_targets.map((target) => (
          <AppBadge key={target} variant="info">
            {getAiImportTargetLabel(target)}
          </AppBadge>
        ))}
      </View>
      <View className="flex-row flex-wrap gap-2">
        {onView ? (
          <AppButton onPress={onView} size="sm" variant="soft">
            View
          </AppButton>
        ) : null}
        {onImport ? (
          <AppButton onPress={onImport} size="sm">
            Import
          </AppButton>
        ) : null}
        {onDismiss ? (
          <AppButton onPress={onDismiss} size="sm" variant="ghost">
            Dismiss
          </AppButton>
        ) : null}
        {onDelete ? (
          <AppButton onPress={onDelete} size="sm" variant="danger">
            Delete
          </AppButton>
        ) : null}
      </View>
    </AppCard>
  );
}
