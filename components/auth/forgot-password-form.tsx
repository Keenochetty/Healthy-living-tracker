"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = { message: "", status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" ? <Alert className="border-destructive/30 text-destructive">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert className="border-primary/30 text-primary">{state.message}</Alert> : null}
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Email</span>
        <Input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
      </label>
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}
