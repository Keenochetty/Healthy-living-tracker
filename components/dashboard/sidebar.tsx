"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/dashboard/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 288 }}
      className="relative z-20 hidden min-h-screen shrink-0 border-r border-white/10 bg-slate-950/55 backdrop-blur-2xl lg:block"
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200 shadow-[0_0_34px_rgba(14,165,233,0.22)]">
          <Activity className="h-5 w-5" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              initial={{ opacity: 0, x: -8 }}
            >
              <p className="whitespace-nowrap text-sm font-semibold text-white">
                Family Health
              </p>
              <p className="whitespace-nowrap text-xs text-slate-400">
                AI care dashboard
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <nav className="space-y-2 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-400 transition duration-300 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center",
                active &&
                  "bg-sky-400/15 text-white shadow-[0_12px_34px_rgba(14,165,233,0.16)]",
              )}
              href={item.href}
              key={item.href}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active && "text-sky-300")}
              />
              {!collapsed ? (
                <span className="truncate">{item.label}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-5 left-3 right-3">
        <Button
          className={cn("w-full", collapsed && "px-0")}
          size={collapsed ? "icon" : "default"}
          type="button"
          variant="outline"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!collapsed ? "Collapse" : null}
        </Button>
      </div>
    </motion.aside>
  );
}
