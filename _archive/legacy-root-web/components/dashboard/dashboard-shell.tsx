import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-transparent text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar email={email} />
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
