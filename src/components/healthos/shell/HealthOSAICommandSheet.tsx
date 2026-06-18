import { HealthOSAIAssistantSheet } from "@/components/healthos/ai/HealthOSAIAssistantSheet";

type HealthOSAICommandSheetProps = {
  initialQuery?: string;
  onClose: () => void;
  onSubmit?: (query: string) => void;
  routeContext?: string;
  suggestions?: string[];
  testID?: string;
  visible: boolean;
};

export function HealthOSAICommandSheet({
  initialQuery,
  onClose,
  routeContext,
  visible,
}: HealthOSAICommandSheetProps) {
  return (
    <HealthOSAIAssistantSheet
      initialQuery={initialQuery}
      onClose={onClose}
      routeContext={routeContext}
      visible={visible}
    />
  );
}
