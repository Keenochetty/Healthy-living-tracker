import { useMemo } from "react";

import { createUIConnectionSummary } from "./uiConnectionStates";
import type {
  HealthOSUIConnectionInput,
  HealthOSUIConnectionSummary,
} from "./uiConnectionTypes";

export function useRealmConnectionState<T>(
  input: HealthOSUIConnectionInput<T>,
): HealthOSUIConnectionSummary {
  return useMemo(
    () => createUIConnectionSummary(input),
    [input.data, input.deferredReason, input.error, input.loading, input.status],
  );
}
