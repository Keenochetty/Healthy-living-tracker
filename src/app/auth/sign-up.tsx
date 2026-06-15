import { Href, router } from "expo-router";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { AppButton } from "@/components/ui";

export default function SignUpScreen() {
  return (
    <AuthShell
      subtitle="Create an account to sync your setup while keeping optional health modules private."
      title="Create your care space"
    >
      <AuthForm mode="signup" onSuccess={() => router.replace("/" as Href)} />
      <AppButton
        fullWidth
        onPress={() => router.push("/auth/sign-in" as Href)}
        title="I already have an account"
        variant="outline"
      />
    </AuthShell>
  );
}
