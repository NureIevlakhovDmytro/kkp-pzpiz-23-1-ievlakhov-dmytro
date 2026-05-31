import { cn } from '@/lib/utils';

const TONE = {
  active: 'bg-success/10 text-success border-success/20',
  archived: 'bg-muted text-muted-foreground border-border',
  danger: 'bg-danger/10 text-danger border-danger/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-info/10 text-info border-info/20',
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
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}
