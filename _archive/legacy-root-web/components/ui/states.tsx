import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="glass-panel flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 px-6 py-10 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <div className="space-y-1">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
}) {
  return (
    <div className="glass-panel flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm text-slate-400">{message}</p>
      </div>
      {actionLabel ? <Button variant="outline">{actionLabel}</Button> : null}
    </div>
  );
}
