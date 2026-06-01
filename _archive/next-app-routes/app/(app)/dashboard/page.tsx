import { PremiumDashboard } from "@/components/dashboard/premium-widgets";
import { getAppData } from "@/lib/health/data";

export default async function DashboardPage() {
  const data = await getAppData();

  return <PremiumDashboard data={data} />;
}
