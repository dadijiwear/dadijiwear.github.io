import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted-custom/20", className)}
      {...props}
    />
  );
}

export { Skeleton };

export function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border-custom shadow-sm flex flex-col h-full">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <div className="p-4 space-y-3 flex-1">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="pt-2 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-sm" />
          <Skeleton className="h-9 w-9 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-20 h-20 md:w-32 md:h-32 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
