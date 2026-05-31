'use client';
import { useState } from 'react';
import { Pencil, Archive, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductDto } from '@app/shared';
import { Role } from '@app/shared';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { PageHeader } from '@/components/data/page-header';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';
import { useProducts, useProductMutations } from './use-products';
import { ProductForm } from './product-form';

export function ProductsTable() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const { data, isLoading } = useProducts();
  const { archive } = useProductMutations();
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toArchive, setToArchive] = useState<ProductDto | null>(null);

  const columns: Column<ProductDto>[] = [
    {
      key: 'name',
      header: 'Назва',
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'sku',
      header: 'Артикул',
      cell: (p) => <span className="nums text-muted-foreground">{p.sku ?? '—'}</span>,
    },
    {
      key: 'minStock',
      header: 'Мін. залишок',
      className: 'text-right',
      cell: (p) => <span className="nums">{p.minStock}</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      cell: (p) => (
        <StatusBadge tone={p.isActive ? 'active' : 'archived'}>
          {p.isActive ? 'Активний' : 'Архів'}
        </StatusBadge>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (p: ProductDto) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(p);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {p.isActive && (
                  <Button variant="ghost" size="icon" onClick={() => setToArchive(p)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  async function confirmArchive() {
    if (!toArchive) return;
    try {
      await archive.mutateAsync(toArchive.id);
      toast.success('Архівовано');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Помилка');
    } finally {
      setToArchive(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Номенклатура"
        description="Товарно-матеріальні цінності"
        actions={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Створити
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        loading={isLoading}
        empty="Немає товарів"
      />
      <ProductForm open={formOpen} product={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toArchive}
        title="Архівувати цей товар?"
        confirmLabel="Архівувати"
        onConfirm={confirmArchive}
        onCancel={() => setToArchive(null)}
      />
    </>
  );
}
