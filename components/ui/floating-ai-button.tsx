import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui/AppIcon";
import { layout } from "@/constants/layout";
import { spacing } from "@/constants/spacing";
import { colors, shadows } from "@/constants/theme";

const aiBlue = "#2563EB";
const collapsedSize = 56;
const expandedMaxWidth = 420;

type FloatingAIButtonProps = {
  onSubmit?: (value: string) => void;
};

type SpeechRecognitionResultLike = {
  readonly 0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  results: {
    readonly [index: number]: SpeechRecognitionResultLike;
    length: number;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition() {
  const speechGlobal = globalThis as typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechGlobal.SpeechRecognition ?? speechGlobal.webkitSpeechRecognition;
}

export function FloatingAIButton({ onSubmit }: FloatingAIButtonProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [query, setQuery] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const expandedWidth = Math.min(width * 0.85, expandedMaxWidth);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    Animated.spring(progress, {
      damping: 20,
      mass: 0.8,
      stiffness: 130,
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: false,
    }).start(() => {
      if (isExpanded) {
        inputRef.current?.focus();
      }
    });
  }, [isExpanded, progress]);

  function expand() {
    setIsExpanded(true);
    setVoiceStatus(null);
  }

  function collapse() {
    inputRef.current?.blur();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setQuery("");
    setVoiceStatus(null);
    setIsExpanded(false);
  }

  function handleSubmit() {
    const nextQuery = query.trim();

    if (!nextQuery) {
      return;
    }

    onSubmit?.(nextQuery);
    collapse();
  }

  function handleMicPress() {
    if (!isExpanded) {
      expand();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceStatus("Voice stopped. You can edit the text before sending.");
      inputRef.current?.focus();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition || Platform.OS !== "web") {
      setVoiceStatus(
        "Voice text capture is available on web browsers with speech recognition. Type your message here for now.",
      );
      inputRef.current?.focus();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult?.[0]?.transcript?.trim();

      if (transcript) {
        setQuery(transcript);
        setVoiceStatus("Captured voice as text. Review it before sending.");
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus(
        "Voice capture could not start. Check microphone permissions or type your message.",
      );
      inputRef.current?.focus();
    };
    recognition.onend = () => {
      setIsListening(false);
      inputRef.current?.focus();
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    setVoiceStatus("Listening...");
    recognition.start();
  }

  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [collapsedSize, expandedWidth],
  });
  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0, 1],
  });
  const collapsedOpacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 0, 0],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.shell,
        {
          alignItems: isExpanded ? "center" : "flex-end",
          bottom:
            insets.bottom +
            layout.floatingActionBottomOffset +
            keyboardHeight +
            (isExpanded ? 24 : 12),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: isExpanded ? colors.card.background : aiBlue,
            borderColor: isExpanded ? colors.border.soft : aiBlue,
            transform: [{ translateY }],
            width: animatedWidth,
          },
        ]}
      >
        {!isExpanded ? (
          <Pressable
            accessibilityRole="button"
            onPress={expand}
            style={({ pressed }) => [
              styles.collapsedButton,
              pressed && styles.pressed,
            ]}
          >
            <Animated.View style={{ opacity: collapsedOpacity }}>
              <AppIcon
                color={colors.text.inverse}
                name="ai"
                size={23}
                variant="filled"
              />
            </Animated.View>
          </Pressable>
        ) : (
          <Animated.View
            style={[styles.expandedContent, { opacity: contentOpacity }]}
          >
            <AppIcon color={aiBlue} name="ai" size={21} variant="filled" />
            <TextInput
              accessibilityLabel="Ask Health AI"
              onChangeText={setQuery}
              onSubmitEditing={handleSubmit}
              placeholder="Ask Health AI..."
              placeholderTextColor={colors.text.muted}
              ref={inputRef}
              returnKeyType="search"
              style={styles.input}
              value={query}
            />
            <Pressable
              accessibilityLabel={
                isListening ? "Stop microphone" : "Use microphone"
              }
              accessibilityRole="button"
              onPress={handleMicPress}
              style={({ pressed }) => [
                styles.iconButton,
                isListening && styles.listeningButton,
                pressed && styles.iconPressed,
              ]}
            >
              <AppIcon
                color={isListening ? aiBlue : colors.text.secondary}
                name="voice"
                size={20}
                variant={isListening ? "filled" : "outline"}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="Close Health AI"
              accessibilityRole="button"
              onPress={collapse}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconPressed,
              ]}
            >
              <AppIcon color={colors.text.secondary} name="close" size={20} />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
      {isExpanded && voiceStatus ? (
        <Text style={styles.voiceStatus}>{voiceStatus}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedButton: {
    alignItems: "center",
    height: collapsedSize,
    justifyContent: "center",
    width: collapsedSize,
  },
  expandedContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    height: collapsedSize,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconPressed: {
    backgroundColor: colors.background.mist,
    opacity: 0.85,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 0,
    padding: 0,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    height: collapsedSize,
    overflow: "hidden",
    ...shadows.soft,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  shell: {
    left: 0,
    paddingHorizontal: spacing["2xl"],
    position: "absolute",
    right: 0,
    zIndex: 30,
  },
  listeningButton: {
    backgroundColor: colors.brand.primarySoft,
  },
  voiceStatus: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
    maxWidth: expandedMaxWidth,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: "center",
    width: "85%",
  },
});
