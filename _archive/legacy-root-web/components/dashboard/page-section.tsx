import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";

type PageSectionProps = {
  title: string;
  description: string;
  badge: string;
  cards: Array<{ title: string; value: string; detail: string }>;
  emptyTitle: string;
  emptyMessage: string;
};

export function PageSection({
  title,
  description,
  badge,
  cards,
  emptyTitle,
  emptyMessage,
}: PageSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge>{badge}</Badge>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <EmptyState message={emptyMessage} title={emptyTitle} />
        <Card>
          <CardHeader>
            <CardTitle>Reactive states</CardTitle>
            <CardDescription>
              Reusable loading and error patterns for this section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border">
              <LoadingState label="Loading latest health data" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <ErrorState message="This placeholder shows how recoverable errors will appear when live data is connected." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
