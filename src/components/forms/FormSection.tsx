import { Text, View } from "react-native";

import { appColors, appSpacing, typography } from "@/theme/designSystem";

type FormSectionProps = {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function FormSection({ children, subtitle, title }: FormSectionProps) {
  return (
    <View style={{ gap: appSpacing.md }}>
      <View>
        <Text style={[typography.sectionTitle, { color: appColors.text }]}>{title}</Text>
        {subtitle ? <Text style={[typography.body, { color: appColors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}
