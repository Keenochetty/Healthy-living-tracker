"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = { message: "", status: "idle" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" ? <Alert className="border-destructive/30 text-destructive">{state.message}</Alert> : null}
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Email or phone</span>
        <Input autoComplete="username" name="identifier" placeholder="you@example.com or +15551234567" />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Password</span>
        <Input autoComplete="current-password" name="password" placeholder="At least 8 characters" type="password" />
      </label>
      <div className="flex justify-end">
        <Link className="text-sm font-medium text-sky-300 hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
