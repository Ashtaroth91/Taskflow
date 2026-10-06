import { cn } from '../../utils/cn.js';

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-border bg-secondary text-secondary-foreground',
    destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
    outline: 'border-border text-foreground bg-transparent',
    muted: 'border-border/60 bg-muted/60 text-muted-foreground',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    warning: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    info: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
