import * as Clipboard from "expo-clipboard";
import { X } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, View } from "react-native";

import {
  AppButton,
  AppCard,
  AppIconButton,
  AppInput,
  AppText,
} from "@/components/ui-native";
import {
  PASTED_RESULT_TYPE_OPTIONS,
  parsePastedChatGptResult,
  type PastedResultType,
} from "@/features/ai/parsePastedChatGptResult";
import type { AiStructuredResult } from "@/features/ai/types";
import { useAppTheme } from "@/theme/ThemeProvider";

type PasteChatGptResultSheetProps = {
  onClose: () => void;
  onParsed: (result: AiStructuredResult) => void;
  pastedText: string;
  resultType: PastedResultType;
  setPastedText: (value: string) => void;
  setResultType: (value: PastedResultType) => void;
  visible: boolean;
};

export function PasteChatGptResultSheet({
  onClose,
  onParsed,
  pastedText,
  resultType,
  setPastedText,
  setResultType,
  visible,
}: PasteChatGptResultSheetProps) {
  const { theme } = useAppTheme();
  const [clipboardStatus, setClipboardStatus] = useState<string | null>(null);
  const canParse = pastedText.trim().length > 0;

  function parseResult() {
    if (!canParse) return;
    onParsed(parsePastedChatGptResult(pastedText, resultType));
  }

  async function pasteFromClipboard() {
    const text = await Clipboard.getStringAsync();
    if (!text.trim()) {
      setClipboardStatus("Clipboard is empty.");
      return;
    }

    setPastedText(text);
    setClipboardStatus("Clipboard text pasted locally.");
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <View className="flex-1 bg-background">
        <View className="border-b border-border px-5 py-4">
          <View className="w-full max-w-3xl self-center flex-row items-center gap-3">
            <View className="flex-1">
              <AppText variant="subtitle">Paste ChatGPT result</AppText>
              <AppText variant="caption">
                Convert pasted text locally. HealthSync does not call OpenAI.
              </AppText>
            </View>
            <AppIconButton
              accessibilityLabel="Close paste result"
              icon={<X color={theme.text} size={20} />}
              onPress={onClose}
            />
          </View>
        </View>
        <ScrollView
          contentContainerClassName="w-full max-w-3xl self-center gap-5 px-5 py-5"
          keyboardShouldPersistTaps="handled"
        >
          <AppCard className="gap-4">
            <AppText variant="label">What did ChatGPT create?</AppText>
            <View className="flex-row flex-wrap gap-2">
              {PASTED_RESULT_TYPE_OPTIONS.map((option) => (
                <AppButton
                  key={option.value}
                  onPress={() => setResultType(option.value)}
                  size="sm"
                  variant={resultType === option.value ? "primary" : "soft"}
                >
                  {option.label}
                </AppButton>
              ))}
            </View>
          </AppCard>

          <AppButton fullWidth onPress={pasteFromClipboard} variant="soft">
            Paste from clipboard
          </AppButton>
          {clipboardStatus ? (
            <AppText variant="caption">{clipboardStatus}</AppText>
          ) : null}

          <AppInput
            className="min-h-52"
            label="Paste result"
            multiline
            onChangeText={setPastedText}
            placeholder="Paste the useful ChatGPT response here..."
            textAlignVertical="top"
            value={pastedText}
          />

          <AppButton disabled={!canParse} fullWidth onPress={parseResult}>
            Create import preview
          </AppButton>
          <AppText variant="caption">
            HealthSync does not access your full ChatGPT history. Only results
            you paste or import here are saved in HealthSync.
          </AppText>
        </ScrollView>
      </View>
    </Modal>
  );
}
