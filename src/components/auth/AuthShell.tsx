import type { ReactNode } from "react";

import { HealthOSAuthScreen } from "@/components/healthos/auth";

type AuthShellProps = {
  children: ReactNode;
  subtitle?: string;
  title?: string;
};

export function AuthShell({
  children,
  subtitle = "Your private family health companion",
  title = "HealthOS",
}: AuthShellProps) {
  return (
    <HealthOSAuthScreen subtitle={subtitle} title={title}>
      {children}
    </HealthOSAuthScreen>
  );
}
