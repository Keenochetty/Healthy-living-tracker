import { Text, TextInput, type KeyboardTypeOptions, type TextInputProps, View } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppFormInputProps = Omit<TextInputProps, "placeholder" | "value" | "onChangeText"> & {
  errorText?: string;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export function AppFormInput({ errorText, helperText, label, multiline, style, ...props }: AppFormInputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={{ color: theme.text, fontWeight: "900" }}>{label}</Text> : null}
      <TextInput
        multiline={multiline}
        placeholderTextColor="#94a3b8"
        style={[
          {
            backgroundColor: theme.surface,
            borderColor: errorText ? theme.danger : theme.border,
            borderRadius: radius.lg,
            borderWidth: 1,
            color: theme.text,
            fontSize: 16,
            minHeight: multiline ? 82 : 52,
            paddingHorizontal: spacing.lg,
            paddingTop: multiline ? spacing.md : undefined,
            textAlignVertical: multiline ? "top" : "center"
          },
          style
        ]}
        {...props}
      />
      {errorText ? <Text style={{ color: theme.danger, fontSize: 12 }}>{errorText}</Text> : null}
      {!errorText && helperText ? <Text style={{ color: theme.mutedText, fontSize: 12 }}>{helperText}</Text> : null}
    </View>
  );
}
