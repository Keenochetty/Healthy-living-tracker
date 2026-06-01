import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-slate-950/45 px-4 backdrop-blur-2xl lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input className="h-11 pl-9" placeholder="Search records, people, documents" />
        </div>
        <div className="md:hidden">
          <p className="text-sm font-semibold text-white">Family Health</p>
          <p className="truncate text-xs text-slate-400">{email ?? "Secure dashboard"}</p>
        </div>
      </div>
      <div className="hidden rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100 sm:block">
        Secure sync
      </div>
      <Button aria-label="Notifications" size="icon" type="button" variant="ghost">
        <Bell className="h-4 w-4" />
      </Button>
      <form action="/auth/signout" method="post">
        <Button size="sm" type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </header>
  );
}
