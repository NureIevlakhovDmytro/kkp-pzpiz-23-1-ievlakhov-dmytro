import { InventoryCount } from '@/features/inventory/inventory-count';

export default function Page({ params }: { params: { id: string } }) {
  return <InventoryCount id={params.id} />;
}
