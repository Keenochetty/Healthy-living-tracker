"use client";

import { useActionState } from "react";
import { askAiHealthAction } from "@/lib/health/actions";
import {
  trackingCategories,
  trackingCategoryLabels,
} from "@/lib/health/constants";
import type { AiChat, DocumentRecord, FamilyMember } from "@/lib/health/types";
import {
  ActionToast,
  FormSubmit,
  initialActionState,
} from "@/components/forms/action-feedback";
import { SelectField, TextareaField } from "@/components/forms/form-fields";

export function AiChatForm({
  members,
  chats,
  documents,
}: {
  members: FamilyMember[];
  chats: AiChat[];
  documents: DocumentRecord[];
}) {
  const [state, action] = useActionState(askAiHealthAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField
        label="Previous chat"
        name="chat_id"
        options={chats.map((chat) => ({ value: chat.id, label: chat.title }))}
        placeholder="Start new chat"
      />
      <SelectField
        label="Family member context"
        name="family_member_id"
        options={members.map((m) => ({ value: m.id, label: m.name }))}
        placeholder="Optional member"
      />
      <SelectField
        label="Category filter"
        name="category_filter"
        options={trackingCategories.map((value) => ({
          value,
          label: trackingCategoryLabels[value],
        }))}
        placeholder="Optional category"
      />
      <SelectField
        label="Attach document"
        name="attachment_document_id"
        options={documents.map((document) => ({
          value: document.id,
          label: document.file_name,
        }))}
        placeholder="Optional document"
      />
      <TextareaField
        label="Question"
        name="message"
        placeholder="Ask for educational guidance, appointment prep, or a summary of selected context."
      />
      <p className="text-xs text-muted-foreground">
        AI Health provides educational guidance only. It cannot diagnose,
        prescribe, replace a doctor, or handle emergencies.
      </p>
      <FormSubmit>Ask AI</FormSubmit>
    </form>
  );
}
