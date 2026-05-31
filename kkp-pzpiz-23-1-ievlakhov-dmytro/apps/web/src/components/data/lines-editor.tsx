'use client';
import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function LinesEditor({ count, onAdd, onRemove, addLabel, renderRow }: {
  count: number; onAdd: () => void; onRemove: (i: number) => void; addLabel: string; renderRow: (i: number) => ReactNode;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-end gap-2 rounded-md border border-border p-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-3">{renderRow(i)}</div>
          <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(i)} disabled={count <= 1}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus className="mr-2 h-4 w-4" />{addLabel}</Button>
    </div>
  );
}
