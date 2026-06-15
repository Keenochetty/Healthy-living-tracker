import { ActivityList } from "@/components/dashboard/data-lists";
import {
  DoctorVisitForm,
  HealthLogForm,
  MedicineLogForm,
  TemperatureLogForm,
} from "@/components/forms/log-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAppData } from "@/lib/health/data";

export default async function TrackPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Track</h1>
        <p className="text-sm text-muted-foreground">
          Reusable tracking for symptoms, medicine, temperature, blood pressure,
          weight, mood, pain, sleep, feeding, diaper, vaccinations, and doctor
          visits.
        </p>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All activity</TabsTrigger>
          <TabsTrigger value="health">Health log</TabsTrigger>
          <TabsTrigger value="medicine">Medicine</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="doctor">Doctor visit</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ActivityList
            doctorVisits={data.doctorVisits}
            documents={data.documents}
            healthLogs={data.healthLogs}
            medicineLogs={data.medicineLogs}
            temperatureLogs={data.temperatureLogs}
          />
        </TabsContent>
        <TabsContent value="health">
          <FormCard
            description="Select member, category, and date for any general tracking entry."
            title="Add health log"
          >
            <HealthLogForm members={data.members} />
          </FormCard>
        </TabsContent>
        <TabsContent value="medicine">
          <FormCard title="Log medicine">
            <MedicineLogForm members={data.members} />
          </FormCard>
        </TabsContent>
        <TabsContent value="temperature">
          <FormCard title="Log temperature">
            <TemperatureLogForm members={data.members} />
          </FormCard>
        </TabsContent>
        <TabsContent value="doctor">
          <FormCard title="Add doctor visit">
            <DoctorVisitForm members={data.members} />
          </FormCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
