"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "@/components/dashboard/nav-items";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-4 z-30 grid grid-cols-5 rounded-3xl border border-white/10 bg-slate-950/80 px-2 py-2 shadow-[0_22px_70px_rgba(2,8,23,0.55)] backdrop-blur-2xl lg:hidden">
      {mobileNavItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium text-slate-400 transition",
              active && "bg-sky-400/15 text-white"
            )}
            href={item.href}
            key={item.href}
          >
            <Icon className="h-4 w-4" />
            <span className="w-full truncate text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
