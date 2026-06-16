import { View } from "react-native";

import {
  AppBadge,
  AppButton,
  AppCard,
  AppText,
} from "@/components/ui-native";
import { getAiImportTargetLabel } from "@/features/ai/aiImportRouting";
import type { AiStructuredResult } from "@/features/ai/types";

type AiImportPreviewProps = {
  onDismiss: () => void;
  onEdit: () => void;
  onImport: () => void;
  onSave?: () => void;
  result: AiStructuredResult;
  saveDisabled?: boolean;
  saveLabel?: string;
};

export function AiImportPreview({
  onDismiss,
  onEdit,
  onImport,
  onSave,
  result,
  saveDisabled = false,
  saveLabel = "Save to HealthSync history",
}: AiImportPreviewProps) {
  return (
    <AppCard className="gap-4" variant="elevated">
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <AppBadge variant="ai">
            {result.type.replaceAll("_", " ")}
          </AppBadge>
          {result.confidence ? (
            <AppBadge>{result.confidence} confidence</AppBadge>
          ) : null}
        </View>
        <AppText variant="subtitle">{result.title}</AppText>
        {result.summary ? (
          <AppText variant="bodyMuted">{result.summary}</AppText>
        ) : null}
        <AppText variant="caption">
          Source: {result.source.replaceAll("_", " ")}
        </AppText>
      </View>

      {result.safety_notes?.length ? (
        <NoticeList
          items={result.safety_notes}
          title="Review before importing"
          variant="warning"
        />
      ) : null}
      {result.allergy_flags?.length ? (
        <NoticeList
          items={result.allergy_flags}
          title="Allergy flags"
          variant="danger"
        />
      ) : null}
      {result.diabetic_warning ? (
        <AppText variant="danger">
          Review this draft carefully for diabetes-related considerations.
        </AppText>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        {result.import_targets.map((target) => (
          <AppBadge key={target} variant="info">
            {getAiImportTargetLabel(target)}
          </AppBadge>
        ))}
      </View>

      <View className="gap-2">
        <AppButton fullWidth onPress={onImport}>
          Import to app
        </AppButton>
        {onSave ? (
          <AppButton
            disabled={saveDisabled}
            fullWidth
            onPress={onSave}
            variant="soft"
          >
            {saveLabel}
          </AppButton>
        ) : null}
        <AppButton fullWidth onPress={onEdit} variant="secondary">
          Edit first
        </AppButton>
        <AppButton fullWidth onPress={onDismiss} variant="ghost">
          Dismiss
        </AppButton>
      </View>
    </AppCard>
  );
}

function NoticeList({
  items,
  title,
  variant,
}: {
  items: string[];
  title: string;
  variant: "danger" | "warning";
}) {
  return (
    <View className="gap-1">
      <AppText variant={variant === "danger" ? "danger" : "label"}>
        {title}
      </AppText>
      {items.map((item) => (
        <AppText key={item} variant="caption">
          - {item}
        </AppText>
      ))}
    </View>
  );
}
