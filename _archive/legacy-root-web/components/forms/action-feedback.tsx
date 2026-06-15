"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/health/types";

export const initialActionState: ActionState = { status: "idle", message: "" };

export function ActionToast({ state }: { state: ActionState }) {
  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return null;
}

export function FormSubmit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
