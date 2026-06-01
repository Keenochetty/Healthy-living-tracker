import { ActivityList } from "@/components/dashboard/data-lists";
import { HealthLogForm, MedicineLogForm, TemperatureLogForm } from "@/components/forms/log-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAppData } from "@/lib/health/data";

export default async function BabyChildPage() {
  const data = await getAppData();
  const children = data.members.filter((member) => ["baby", "child"].includes(member.profile_type));
  const members = children.length ? children : data.members;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Baby & Child</h1>
        <p className="text-sm text-muted-foreground">Feeding, sleep, diapers, medicine, temperature, vaccinations, growth, milestones, and sickness logs.</p>
      </div>
      <Tabs defaultValue="activity">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="feeding">Feeding/sleep/diaper</TabsTrigger>
          <TabsTrigger value="medicine">Medicine</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <ActivityList doctorVisits={data.doctorVisits} documents={data.documents} healthLogs={data.healthLogs} medicineLogs={data.medicineLogs} temperatureLogs={data.temperatureLogs} />
        </TabsContent>
        <TabsContent value="feeding">
          <Card className="max-w-2xl"><CardHeader><CardTitle>Log child care entry</CardTitle><CardDescription>Use categories for feeding, sleep, diaper, vaccination, growth, milestones, or sickness notes.</CardDescription></CardHeader><CardContent><HealthLogForm members={members} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="medicine">
          <Card className="max-w-2xl"><CardHeader><CardTitle>Log medicine</CardTitle></CardHeader><CardContent><MedicineLogForm members={members} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="temperature">
          <Card className="max-w-2xl"><CardHeader><CardTitle>Log temperature</CardTitle></CardHeader><CardContent><TemperatureLogForm members={members} /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
