import { ExternalLink, ClipboardPaste } from "lucide-react-native";

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
      <AppText variant="subtitle">Use your own ChatGPT</AppText>
      <AppText variant="bodyMuted">
        Open ChatGPT, ask your question, then bring the useful result back into
        HealthSync.
      </AppText>
      <AppButton
        fullWidth
        leftIcon={<ExternalLink color={theme.background} size={18} />}
        onPress={onOpenChatGpt}
      >
        Open ChatGPT
      </AppButton>
      <AppButton
        fullWidth
        leftIcon={<ClipboardPaste color={theme.text} size={18} />}
        onPress={onPasteResult}
        variant="secondary"
      >
        Paste result
      </AppButton>
      <AppText variant="caption">
        Only results you paste or save here are stored in HealthSync.
      </AppText>
    </AppCard>
  );
}
