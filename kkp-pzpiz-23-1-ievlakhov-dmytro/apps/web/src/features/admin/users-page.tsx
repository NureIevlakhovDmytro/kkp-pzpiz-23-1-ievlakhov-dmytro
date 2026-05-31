'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserDto } from '@app/shared';
import { Role } from '@app/shared';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useUsers, useUserMutations } from './use-users';
import { UserForm } from './user-form';

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useUsers();
  const { anonymize } = useUserMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [toAnon, setToAnon] = useState<UserDto | null>(null);

  const columns: Column<UserDto>[] = [
    { key: 'email', header: t('admin.email'), cell: (u) => u.email },
    { key: 'fullName', header: t('admin.fullName'), cell: (u) => u.fullName },
    {
      key: 'role',
      header: t('admin.role'),
      cell: (u) =>
        u.role === Role.ADMIN ? t('admin.roleAdmin') : t('admin.roleUser'),
    },
    {
      key: 'status',
      header: t('admin.status'),
      cell: (u) =>
        u.anonymizedAt ? (
          <StatusBadge tone="archived">{t('admin.anonymized')}</StatusBadge>
        ) : u.isActive ? (
          <StatusBadge tone="active">{t('admin.active')}</StatusBadge>
        ) : (
          <StatusBadge tone="warning">{t('admin.inactive')}</StatusBadge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (u) =>
        u.anonymizedAt ? null : (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(u);
                setFormOpen(true);
              }}
            >
              {t('admin.edit')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              onClick={() => setToAnon(u)}
            >
              {t('admin.anonymize')}
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('admin.title')}
        description={t('admin.subtitle')}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.new')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        loading={isLoading}
        empty={t('common.empty')}
      />
      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
      <ConfirmDialog
        open={!!toAnon}
        title={t('admin.anonymizeConfirm')}
        confirmLabel={t('admin.anonymize')}
        onConfirm={() => {
          if (toAnon) anonymize.mutate(toAnon.id);
          setToAnon(null);
        }}
        onCancel={() => setToAnon(null)}
      />
    </>
  );
}
