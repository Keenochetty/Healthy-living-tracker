"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { profileTypes, userRoles } from "@/lib/health/constants";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const emailPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone number."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

const phaseTwoSignupSchema = z
  .object({
    contactMethod: z.enum(["email", "phone"]),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    fullName: z.string().trim().min(2, "Enter your full name."),
    accountRole: z.enum(userRoles),
    profileType: z.enum(profileTypes),
    familySetup: z.enum(["create", "join"]),
    familyName: z.string().trim().optional(),
    joinCode: z.string().trim().optional()
  })
  .superRefine((data, ctx) => {
    if (data.contactMethod === "email" && !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({ code: "custom", message: "Enter a valid email address.", path: ["email"] });
    }

    if (data.contactMethod === "phone" && !/^\+[1-9]\d{7,14}$/.test(data.phone ?? "")) {
      ctx.addIssue({ code: "custom", message: "Enter a phone number in international format, for example +15551234567.", path: ["phone"] });
    }

    if (data.familySetup === "create" && !data.familyName?.trim()) {
      ctx.addIssue({ code: "custom", message: "Enter a family name.", path: ["familyName"] });
    }

    if (data.familySetup === "join" && !data.joinCode?.trim()) {
      ctx.addIssue({ code: "custom", message: "Enter a family join code.", path: ["joinCode"] });
    }
  });

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.")
});

function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function loginAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Check your login details.", status: "error" };
  }

  const supabase = await createClient();
  const authCredentials = parsed.data.identifier.includes("@")
    ? { email: parsed.data.identifier, password: parsed.data.password }
    : { phone: parsed.data.identifier, password: parsed.data.password };
  const { error } = await supabase.auth.signInWithPassword(authCredentials);

  if (error) {
    return { message: error.message, status: "error" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signupAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = phaseTwoSignupSchema.safeParse({
    fullName: formData.get("fullName"),
    contactMethod: formData.get("contactMethod") || "email",
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    accountRole: formData.get("accountRole") || "parent_guardian",
    profileType: formData.get("profileType") || "parent_guardian",
    familySetup: formData.get("familySetup") || "create",
    familyName: formData.get("familyName"),
    joinCode: formData.get("joinCode")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Check your signup details.", status: "error" };
  }

  const supabase = await createClient();
  const authCredentials =
    parsed.data.contactMethod === "phone"
      ? { phone: parsed.data.phone!, password: parsed.data.password }
      : { email: parsed.data.email!, password: parsed.data.password };

  const { error } = await supabase.auth.signUp({
    ...authCredentials,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.contactMethod === "phone" ? parsed.data.phone : null,
        app_role: parsed.data.accountRole,
        profile_type: parsed.data.profileType,
        family_setup: parsed.data.familySetup,
        family_name: parsed.data.familyName || null,
        family_join_code: parsed.data.joinCode || null
      },
      emailRedirectTo: `${getOrigin()}/dashboard`
    }
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  return { message: "Account created. Check your email if confirmation is enabled.", status: "success" };
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Enter a valid email address.", status: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getOrigin()}/login`
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  return { message: "Password reset instructions were sent if that account exists.", status: "success" };
}
