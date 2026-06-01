import { ActivityList } from "@/components/dashboard/data-lists";
import { HealthLogForm } from "@/components/forms/log-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/health/data";

export default async function PregnancyPage() {
  const data = await getAppData();
  const pregnancyMembers = data.members.filter((member) => ["pregnant_mother", "postpartum_mother"].includes(member.profile_type));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pregnancy</h1>
        <p className="text-sm text-muted-foreground">Due date, pregnancy week, trimester, symptoms, blood pressure, scans, antenatal visits, and reports.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Pregnancy profiles" value={pregnancyMembers.length} />
        <Metric title="Symptom logs" value={data.healthLogs.filter((log) => log.category === "symptom").length} />
        <Metric title="Doctor visits" value={data.doctorVisits.length} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <ActivityList doctorVisits={data.doctorVisits} documents={data.documents.filter((d) => ["scan_image", "doctor_report", "lab_result"].includes(d.category))} healthLogs={data.healthLogs} medicineLogs={[]} temperatureLogs={data.temperatureLogs} />
        <Card>
          <CardHeader>
            <CardTitle>Log pregnancy update</CardTitle>
            <CardDescription>Use health logs for symptoms, blood pressure, scans, and antenatal notes.</CardDescription>
          </CardHeader>
          <CardContent><HealthLogForm members={pregnancyMembers.length ? pregnancyMembers : data.members} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <Card><CardHeader><CardDescription>{title}</CardDescription><CardTitle>{value}</CardTitle></CardHeader></Card>;
}
