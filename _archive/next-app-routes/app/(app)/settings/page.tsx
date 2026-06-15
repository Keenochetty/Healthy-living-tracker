import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAppData } from "@/lib/health/data";

export default async function SettingsPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Workspace, notifications, privacy, SMTP readiness, and subscription
          status.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>{data.family?.name}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Family data is protected through Supabase RLS memberships.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              {data.subscription?.plan ?? "free"} •{" "}
              {data.subscription?.status ?? "active"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Payment integration is not enabled in this pass.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SMTP placeholders</CardTitle>
            <CardDescription>
              Invite and reminder email structure is prepared.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM
            when email sending is enabled.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI</CardTitle>
            <CardDescription>
              {process.env.OPENAI_API_KEY
                ? "Configured"
                : "OPENAI_API_KEY missing"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            AI responses are educational only and include medical disclaimers.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
