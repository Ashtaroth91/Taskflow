import { cn } from '../../utils/cn.js';

export function LoadingSkeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60', className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4 rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm">
      <LoadingSkeleton className="h-6 w-1/3" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-4">
        <LoadingSkeleton className="h-8 w-20 rounded-full" />
        <LoadingSkeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center pb-2 border-b border-border/60">
        <LoadingSkeleton className="h-5 w-1/4" />
        <LoadingSkeleton className="h-5 w-1/6" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
          <div className="flex items-center gap-3 w-1/3">
            <LoadingSkeleton className="h-8 w-8 rounded-full" />
            <LoadingSkeleton className="h-4 w-3/4" />
          </div>
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
