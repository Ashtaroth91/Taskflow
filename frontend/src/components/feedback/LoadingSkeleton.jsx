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
    <div className="p-6 space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm">
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
