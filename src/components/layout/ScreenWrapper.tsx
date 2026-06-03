import { ReactNode } from "react";

import { AppScreen } from "@/components/ui/AppScreen";

type ScreenWrapperProps = {
  backgroundColor?: string;
  children: ReactNode;
};

export function ScreenWrapper({ backgroundColor, children }: ScreenWrapperProps) {
  return <AppScreen backgroundColor={backgroundColor}>{children}</AppScreen>;
}
