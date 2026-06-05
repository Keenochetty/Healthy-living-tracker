import { Text, TextInput, type TextInputProps, View } from "react-native";

import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";

type FormFieldProps = TextInputProps & {
  error?: string;
  helper?: string;
  label: string;
  optional?: boolean;
};

export function FormField({ error, helper, label, optional, style, ...props }: FormFieldProps) {
  return (
    <View style={{ gap: appSpacing.sm }}>
      <Text style={[typography.helper, { color: appColors.text }]}>
        {label}
        {optional ? <Text style={{ color: appColors.textMuted }}> optional</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={appColors.textMuted}
        style={[
          {
            backgroundColor: appColors.surface,
            borderColor: error ? appColors.error : appColors.border,
            borderRadius: appRadius.lg,
            borderWidth: 1,
            color: appColors.text,
            minHeight: 52,
            paddingHorizontal: appSpacing.lg
          },
          style
        ]}
        {...props}
      />
      {error ? <Text style={[typography.caption, { color: appColors.error }]}>{error}</Text> : null}
      {!error && helper ? <Text style={[typography.caption, { color: appColors.textSecondary }]}>{helper}</Text> : null}
    </View>
  );
}
