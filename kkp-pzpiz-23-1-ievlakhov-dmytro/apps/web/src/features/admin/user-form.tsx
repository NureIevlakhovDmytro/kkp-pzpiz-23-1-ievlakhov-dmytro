'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { UserDto } from '@app/shared';
import { Role, Locale } from '@app/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/data/entity-select';
import { ApiError } from '@/lib/api-client';
import { useUserMutations } from './use-users';

interface FormValues {
  email: string;
  fullName: string;
  password: string;
  role: Role;
  locale: Locale;
}

export function UserForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: UserDto | null;
}) {
  const { t } = useTranslation();
  const { create, update } = useUserMutations();
  const { register, handleSubmit, watch, setValue, reset } =
    useForm<FormValues>({
      defaultValues: {
        email: '',
        fullName: '',
        password: '',
        role: Role.USER,
        locale: Locale.UK,
      },
    });
  useEffect(() => {
    if (editing)
      reset({
        email: editing.email,
        fullName: editing.fullName,
        password: '',
        role: editing.role,
        locale: editing.locale,
      });
    else
      reset({
        email: '',
        fullName: '',
        password: '',
        role: Role.USER,
        locale: Locale.UK,
      });
  }, [editing, reset]);

  async function onSubmit(v: FormValues) {
    try {
      if (editing)
        await update.mutateAsync({
          id: editing.id,
          body: { fullName: v.fullName, role: v.role, locale: v.locale },
        });
      else
        await create.mutateAsync({
          email: v.email,
          fullName: v.fullName,
          password: v.password,
          role: v.role,
          locale: v.locale,
        });
      toast.success(t('common.save'));
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const roleOptions = [
    { value: Role.USER, label: t('admin.roleUser') },
    { value: Role.ADMIN, label: t('admin.roleAdmin') },
  ];
  const localeOptions = [
    { value: Locale.UK, label: 'UK' },
    { value: Locale.EN, label: 'EN' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? t('admin.edit') : t('admin.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('admin.email')}</Label>
            <Input
              type="email"
              {...register('email')}
              disabled={!!editing}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('admin.fullName')}</Label>
            <Input {...register('fullName')} />
          </div>
          {!editing && (
            <div className="space-y-1.5">
              <Label>{t('admin.password')}</Label>
              <Input type="password" {...register('password')} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('admin.role')}</Label>
              <EntitySelect
                value={watch('role')}
                onChange={(v) => setValue('role', v as Role)}
                options={roleOptions}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.locale')}</Label>
              <EntitySelect
                value={watch('locale')}
                onChange={(v) => setValue('locale', v as Locale)}
                options={localeOptions}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
