import { ClipboardPaste, Sparkles } from "lucide-react-native";

import { AppButton, AppCard, AppText } from "@/components/ui-native";
import { useAppTheme } from "@/theme/ThemeProvider";

type ChatGptConnectCardProps = {
  onOpenChatGpt: () => void;
  onPasteResult: () => void;
};

export function ChatGptConnectCard({
  onOpenChatGpt,
  onPasteResult,
}: ChatGptConnectCardProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard className="gap-4" variant="elevated">
      <AppText variant="subtitle">Use HealthSync AI</AppText>
      <AppText variant="bodyMuted">
        Ask a question, create a draft plan, or import selected results into
        HealthSync after review.
      </AppText>
      <AppButton
        fullWidth
        leftIcon={<Sparkles color={theme.background} size={18} />}
        onPress={onOpenChatGpt}
      >
        Open AI chat
      </AppButton>
      <AppButton
        fullWidth
        leftIcon={<ClipboardPaste color={theme.text} size={18} />}
        onPress={onPasteResult}
        variant="secondary"
      >
        Paste external result
      </AppButton>
      <AppText variant="caption">
        API calls run through the secure backend. Imports stay draft-only until
        you confirm.
      </AppText>
    </AppCard>
  );
}
