import { useCallback, useEffect, useState } from "react";

import {
  createCaregiverAssignment,
  getCaregiverAssignments,
  updateCaregiverAssignment,
} from "./familySharingService";
import type {
  HealthOSCaregiverAssignment,
  HealthOSCaregiverAssignmentCreateInput,
  HealthOSFamilySharingServiceResult,
} from "./familySharingTypes";

export function useCaregiverAssignments(subjectCareProfileId?: string | null) {
  const [result, setResult] = useState<
    HealthOSFamilySharingServiceResult<HealthOSCaregiverAssignment[]>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getCaregiverAssignments(subjectCareProfileId ?? undefined));
  }, [subjectCareProfileId]);

  const createAssignment = useCallback(
    async (input: HealthOSCaregiverAssignmentCreateInput) => {
      const created = await createCaregiverAssignment(input);
      await refresh();
      return created;
    },
    [refresh],
  );

  const updateAssignment = useCallback(
    async (
      assignmentId: string,
      patch: Parameters<typeof updateCaregiverAssignment>[1],
    ) => {
      const updated = await updateCaregiverAssignment(assignmentId, patch);
      await refresh();
      return updated;
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, createAssignment, refresh, updateAssignment };
}
