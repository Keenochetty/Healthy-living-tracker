"use client";

import { useActionState, useState } from "react";
import { signupAction, type AuthActionState } from "@/lib/auth/actions";
import { profileTypeLabels, profileTypes, userRoleLabels, userRoles } from "@/lib/health/constants";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = { message: "", status: "idle" };

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [familySetup, setFamilySetup] = useState<"create" | "join">("create");

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" ? <Alert className="border-destructive/30 text-destructive">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert className="border-primary/30 text-primary">{state.message}</Alert> : null}
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Full name</span>
        <Input autoComplete="name" name="fullName" placeholder="Jane Doe" />
      </label>
      <fieldset className="grid gap-2 text-sm font-medium text-slate-200">
        <legend>Sign up with</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3">
            <input checked={contactMethod === "email"} name="contactMethod" onChange={() => setContactMethod("email")} type="radio" value="email" />
            <span>Email</span>
          </label>
          <label className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3">
            <input checked={contactMethod === "phone"} name="contactMethod" onChange={() => setContactMethod("phone")} type="radio" value="phone" />
            <span>Phone</span>
          </label>
        </div>
      </fieldset>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Email</span>
        <Input autoComplete="email" disabled={contactMethod !== "email"} name="email" placeholder="you@example.com" type="email" />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Phone</span>
        <Input autoComplete="tel" disabled={contactMethod !== "phone"} name="phone" placeholder="+15551234567" type="tel" />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Password</span>
        <Input autoComplete="new-password" name="password" placeholder="At least 8 characters" type="password" />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Role</span>
        <Select defaultValue="parent_guardian" name="accountRole">
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {userRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {userRoleLabels[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Personal profile type</span>
        <Select defaultValue="parent_guardian" name="profileType">
          <SelectTrigger>
            <SelectValue placeholder="Select profile type" />
          </SelectTrigger>
          <SelectContent>
            {profileTypes.map((profileType) => (
              <SelectItem key={profileType} value={profileType}>
                {profileTypeLabels[profileType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <fieldset className="grid gap-2 text-sm font-medium text-slate-200">
        <legend>Family</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3">
            <input checked={familySetup === "create"} name="familySetup" onChange={() => setFamilySetup("create")} type="radio" value="create" />
            <span>Create</span>
          </label>
          <label className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3">
            <input checked={familySetup === "join"} name="familySetup" onChange={() => setFamilySetup("join")} type="radio" value="join" />
            <span>Join</span>
          </label>
        </div>
      </fieldset>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Family name</span>
        <Input disabled={familySetup !== "create"} name="familyName" placeholder="Johnson Family" />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        <span>Join code</span>
        <Input autoCapitalize="none" disabled={familySetup !== "join"} name="joinCode" placeholder="Invite code" />
      </label>
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
