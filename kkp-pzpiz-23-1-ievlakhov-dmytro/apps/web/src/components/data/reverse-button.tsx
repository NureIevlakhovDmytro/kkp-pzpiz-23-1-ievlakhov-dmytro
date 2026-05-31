'use client';
import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './confirm-dialog';
import { ApiError } from '@/lib/api-client';

export function ReverseButton({ onReverse, confirmTitle, label }: { onReverse: () => Promise<unknown>; confirmTitle: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Undo2 className="mr-2 h-4 w-4" />{label}</Button>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        confirmLabel={label}
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await onReverse();
            toast.success(label);
          } catch (e) {
            toast.error(e instanceof ApiError ? e.message : 'Error');
          } finally {
            setBusy(false);
            setOpen(false);
          }
        }}
      />
    </>
  );
}
