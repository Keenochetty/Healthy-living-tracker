import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getAppData } from "@/lib/health/data";

export default async function ProfilePage() {
  const [{ user }, data] = await Promise.all([getCurrentUser(), getAppData()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Account identity and family access overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardDescription>Email</CardDescription><CardTitle className="text-base">{user.email}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Family</CardDescription><CardTitle className="text-base">{data.family?.name}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Profiles</CardDescription><CardTitle>{data.members.length}</CardTitle></CardHeader></Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Protected by Supabase Auth, SSR cookies, private storage, and row-level security.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Use Settings to review subscription and environment readiness.</CardContent>
      </Card>
    </div>
  );
}
