import { cn } from '@/lib/utils';

const TONE = {
  active: 'bg-success/15 text-success border-success/30',
  archived: 'bg-muted text-muted-foreground border-border',
  danger: 'bg-danger/15 text-danger border-danger/30',
  warning: 'bg-warning/15 text-[hsl(var(--warning))] border-warning/30',
  info: 'bg-info/15 text-info border-info/30',
} as const;

export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof TONE;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium',
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}
