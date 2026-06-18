import { useCallback, useEffect, useState } from "react";

import { createRecord, getRecords } from "./recordService";
import type {
  HealthOSRecord,
  HealthOSRecordCreateInput,
  HealthOSRecordsServiceResult,
} from "./recordTypes";

export function useRecords() {
  const [result, setResult] = useState<HealthOSRecordsServiceResult<HealthOSRecord[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getRecords());
  }, []);

  const create = useCallback(
    async (input: HealthOSRecordCreateInput) => {
      const created = await createRecord(input);
      await refresh();
      return created;
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, create, refresh };
}
