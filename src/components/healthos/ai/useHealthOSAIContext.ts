import { useMemo, useState } from "react";

import type { HealthOSAIConversationContext } from "./HealthOSAITypes";

type Input = {
  contextLabel?: string;
  routeContext?: string;
};

export function useHealthOSAIContext(input: Input = {}) {
  const [attachNotice, setAttachNotice] = useState<string | null>(null);
  const context = useMemo<HealthOSAIConversationContext>(
    () => ({
      attachedDataCategories: [],
      contextLabel: input.contextLabel ?? getContextLabel(input.routeContext),
      dataAccessStatus: "none",
      routeContext: input.routeContext,
    }),
    [input.contextLabel, input.routeContext],
  );

  function requestAttachData() {
    setAttachNotice(
      "No private HealthOS data is attached by default. Pick a specific import or record before sharing context with AI.",
    );
  }

  return {
    attachNotice,
    clearAttachNotice: () => setAttachNotice(null),
    context,
    requestAttachData,
  };
}

function getContextLabel(routeContext?: string) {
  if (routeContext === "calendar") return "Calendar";
  if (routeContext === "family") return "Family";
  if (routeContext === "health") return "Health Hub";
  if (routeContext === "scan") return "Scan";
  if (routeContext === "today" || routeContext === "home") return "Today";
  return "HealthOS";
}
