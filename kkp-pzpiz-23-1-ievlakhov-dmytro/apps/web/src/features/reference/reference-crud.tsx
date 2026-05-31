'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';
import { useCrud } from '@/lib/use-crud';

export interface FieldSpec { name: string; labelKey: string; required?: boolean; }
export interface RefEntity { id: string; isActive: boolean; [k: string]: unknown; }

export interface ReferenceCrudProps {
  resource: string;
  fields: FieldSpec[];
  columns: { key: string; header: string; className?: string }[];
  t: (k: string) => string;
}

export function ReferenceCrud({ resource, fields, columns, t }: ReferenceCrudProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const { list, create, update, archive } = useCrud<RefEntity, Record<string, unknown>>(resource);
  const [editing, setEditing] = useState<RefEntity | null>(null);
  const [open, setOpen] = useState(false);
  const [toArchive, setToArchive] = useState<RefEntity | null>(null);
  const { register, handleSubmit, reset } = useForm<Record<string, string>>();

  useEffect(() => {
    if (open) reset(Object.fromEntries(fields.map((f) => [f.name, (editing?.[f.name] as string) ?? ''])));
  }, [open, editing, fields, reset]);

  async function onSubmit(values: Record<string, string>) {
    const body: Record<string, unknown> = {};
    for (const f of fields) if (values[f.name] !== '') body[f.name] = values[f.name];
    try {
      if (editing) await update.mutateAsync({ id: editing.id, body });
      else await create.mutateAsync(body);
      toast.success(t('common.save'));
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error');
    }
  }

  const tableColumns: Column<RefEntity>[] = [
    ...columns.map((c) => ({
      key: c.key,
      header: c.header,
      className: c.className,
      cell: (r: RefEntity) => <span className={c.key === 'code' ? 'nums' : ''}>{(r[c.key] as string) ?? '—'}</span>,
    })),
    {
      key: 'status',
      header: t('reference.status' as never) || 'Status',
      cell: (r: RefEntity) => (
        <StatusBadge tone={r.isActive ? 'active' : 'archived'}>
          {r.isActive ? t('products.active') : t('products.archived')}
        </StatusBadge>
      ),
    },
    ...(isAdmin ? [{
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (r: RefEntity) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          {r.isActive && (
            <Button variant="ghost" size="icon" onClick={() => setToArchive(r)}>
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            {t('common.create')}
          </Button>
        </div>
      )}
      <DataTable columns={tableColumns} rows={list.data?.items ?? []} loading={list.isLoading} empty={t('common.empty')} />
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('common.create')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label>{t(f.labelKey)}</Label>
                <Input {...register(f.name, { required: f.required })} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!toArchive}
        title={t('reference.archiveConfirm')}
        confirmLabel={t('common.archive')}
        onConfirm={async () => {
          if (toArchive) {
            try {
              await archive.mutateAsync(toArchive.id);
              toast.success(t('common.archive'));
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : 'Error');
            } finally {
              setToArchive(null);
            }
          }
        }}
        onCancel={() => setToArchive(null)}
      />
    </div>
  );
}
