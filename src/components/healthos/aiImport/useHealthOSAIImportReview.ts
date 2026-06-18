import { useMemo, useState } from "react";

import {
  canImportToTarget,
  getAIImportBlockingReasons,
  getMissingRequiredFields,
  saveEnvelopeWithExistingHandler,
  type HealthOSAIFieldReviewStatus,
  type HealthOSAIImportEnvelope,
  type HealthOSAIImportField,
  type HealthOSAIImportTarget,
} from "@/features/aiImport";

type ReviewMessage = {
  kind: "info" | "success" | "warning";
  text: string;
};

export function useHealthOSAIImportReview(initialEnvelope: HealthOSAIImportEnvelope | null) {
  const [envelope, setEnvelope] = useState(initialEnvelope);
  const [selectedTarget, setSelectedTarget] = useState<HealthOSAIImportTarget>(
    initialEnvelope?.primaryTarget ?? initialEnvelope?.suggestedTargets[0] ?? "records",
  );
  const [message, setMessage] = useState<ReviewMessage | null>(null);

  const blockingReasons = useMemo(
    () => (envelope ? getAIImportBlockingReasons(envelope, selectedTarget) : ["No import envelope is available."]),
    [envelope, selectedTarget],
  );
  const missingKeys = useMemo(
    () => (envelope ? getMissingRequiredFields(envelope, selectedTarget) : []),
    [envelope, selectedTarget],
  );
  const canImport = Boolean(envelope && canImportToTarget(envelope, selectedTarget));

  function updateField(fieldId: string, updater: (field: HealthOSAIImportField) => HealthOSAIImportField) {
    setEnvelope((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => ({
          ...item,
          fields: item.fields.map((field) => (field.fieldId === fieldId ? updater(field) : field)),
        })),
      };
    });
  }

  function setFieldStatus(fieldId: string, reviewStatus: HealthOSAIFieldReviewStatus) {
    updateField(fieldId, (field) => ({ ...field, reviewStatus }));
  }

  return {
    addToCalendar() {
      setMessage({ kind: "warning", text: "Calendar import is review-only until the selected fields are confirmed and mapped safely." });
    },
    blockingReasons,
    canImport,
    confirmField(fieldId: string) {
      setFieldStatus(fieldId, "confirmed");
    },
    discardImport() {
      setEnvelope((current) => (current ? { ...current, items: current.items.map((item) => ({ ...item, reviewStatus: "dismissed" })) } : current));
      setMessage({ kind: "info", text: "Import dismissed. No app data was saved." });
    },
    editField(fieldId: string, value: HealthOSAIImportField["value"]) {
      updateField(fieldId, (field) => ({ ...field, reviewStatus: "edited", value }));
    },
    envelope,
    importToTarget() {
      if (!envelope || !canImport) {
        setMessage({ kind: "warning", text: blockingReasons[0] ?? "Import is blocked." });
        return;
      }
      void saveEnvelopeWithExistingHandler(envelope, selectedTarget).then((result) => {
        setMessage({ kind: result.deferred ? "warning" : "success", text: result.message });
      });
    },
    message,
    missingFields: envelope?.missingFields.filter((field) => field.requiredForTargets.includes(selectedTarget)) ?? [],
    missingKeys,
    openSourceEvidence(evidenceId: string) {
      setMessage({ kind: "info", text: `Evidence ${evidenceId} selected. Source viewer is deferred.` });
    },
    rejectField(fieldId: string) {
      setFieldStatus(fieldId, "rejected");
    },
    resolveMissingField(fieldId: string, value: HealthOSAIImportField["value"]) {
      updateField(fieldId, (field) => ({ ...field, reviewStatus: "edited", value }));
    },
    reviewedFields: envelope?.items.flatMap((item) => item.fields) ?? [],
    saveToRecords() {
      if (!envelope) return;
      void saveEnvelopeWithExistingHandler(envelope, "records").then((result) => {
        setMessage({ kind: result.deferred ? "warning" : "success", text: result.message });
      });
    },
    selectedTarget,
    setTarget(target: HealthOSAIImportTarget) {
      setSelectedTarget(target);
    },
    warnings: envelope?.warnings ?? [],
  };
}
