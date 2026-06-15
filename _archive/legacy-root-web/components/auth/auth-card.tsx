import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200 shadow-[0_0_34px_rgba(14,165,233,0.22)]">
          <Activity className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        <div className="border-t border-white/10 pt-4 text-center">
          {footer}
        </div>
      </CardContent>
    </Card>
  );
}
