import { PrivacyCareWorkflows } from "@/components/dashboard/privacy-care-workflows";
import { CaregiverActivityForm } from "@/components/forms/log-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/health/data";

export default async function CaregiverPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(15,23,42,0.78)_48%,rgba(251,146,60,0.1))] p-6">
        <h1 className="text-2xl font-semibold text-white">Caregiver workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Switch between personal tracking and assigned child care, with only parent-approved instructions, schedules, emergency details, and shared updates visible in work mode.
        </p>
      </div>
      <PrivacyCareWorkflows data={data} />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Log caregiver activity</CardTitle>
          <CardDescription>Quick updates notify parents when sharing is enabled.</CardDescription>
        </CardHeader>
        <CardContent>
          <CaregiverActivityForm members={data.members} />
        </CardContent>
      </Card>
    </div>
  );
}
