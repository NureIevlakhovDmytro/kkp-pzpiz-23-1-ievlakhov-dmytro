'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { ProductDto, Paginated, UnitDto, CategoryDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import { useProductMutations } from './use-products';

const schema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  unitId: z.string().uuid(),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  minStock: z.coerce.number().min(0).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ProductForm({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: ProductDto | null;
  onClose: () => void;
}) {
  const { create, update } = useProductMutations();
  const [units, setUnits] = useState<UnitDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    void apiFetch<Paginated<UnitDto>>('/units?limit=200').then((r) => setUnits(r.items));
    void apiFetch<Paginated<CategoryDto>>('/categories?limit=200').then((r) =>
      setCategories(r.items),
    );
    reset(
      product
        ? {
            name: product.name,
            sku: product.sku ?? '',
            unitId: product.unitId,
            categoryId: product.categoryId ?? '',
            minStock: product.minStock,
          }
        : { name: '', sku: '', unitId: '', categoryId: '', minStock: 0 },
    );
  }, [open, product, reset]);

  async function onSubmit(values: FormValues) {
    const body = { ...values, categoryId: values.categoryId || undefined };
    try {
      if (product) await update.mutateAsync({ id: product.id, body });
      else await create.mutateAsync(body);
      toast.success('Збережено');
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Помилка');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Редагувати товар' : 'Новий товар'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Назва</Label>
            <Input {...register('name')} autoFocus />
            {errors.name && <p className="text-xs text-danger">Обов&apos;язкове поле</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Артикул</Label>
            <Input {...register('sku')} />
          </div>
          <div className="space-y-1.5">
            <Label>Одиниця</Label>
            <Select value={watch('unitId')} onValueChange={(v) => setValue('unitId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} · {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitId && <p className="text-xs text-danger">Оберіть одиницю</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Категорія</Label>
            <Select
              value={watch('categoryId') || ''}
              onValueChange={(v) => setValue('categoryId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Мін. залишок</Label>
            <Input type="number" step="0.001" className="nums" {...register('minStock')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit">Зберегти</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
