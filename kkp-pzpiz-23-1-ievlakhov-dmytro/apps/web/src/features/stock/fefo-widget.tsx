'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FefoSuggestionDto, ProductDto, StorageLocationDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/data/status-badge';
import { stockApi } from './stock.api';

export function FefoWidget({ products, locations }: { products: ProductDto[]; locations: StorageLocationDto[] }) {
  const { t } = useTranslation();
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [result, setResult] = useState<FefoSuggestionDto | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!productId || !locationId) return;
    setBusy(true);
    try {
      setResult(await stockApi.fefo(productId, locationId, Number(quantity)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('stock.fefoTitle')}</CardTitle><p className="text-xs text-muted-foreground">{t('stock.fefoDesc')}</p></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue placeholder={t('batches.product')} /></SelectTrigger>
            <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger><SelectValue placeholder={t('stock.location')} /></SelectTrigger>
            <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="number" className="nums" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Button onClick={() => void run()} disabled={busy || !productId || !locationId}>{t('stock.calc')}</Button>
          </div>
        </div>
        {result && (
          <div className="space-y-2 rounded-md border border-border p-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <StatusBadge tone="info">{t('stock.requested')}: <span className="nums ml-1">{result.requested}</span></StatusBadge>
              <StatusBadge tone="active">{t('stock.allocated')}: <span className="nums ml-1">{result.allocated}</span></StatusBadge>
              {result.shortfall > 0 && <StatusBadge tone="danger">{t('stock.shortfall')}: <span className="nums ml-1">{result.shortfall}</span></StatusBadge>}
            </div>
            <ul className="space-y-1 text-sm">
              {result.allocations.map((a) => (
                <li key={a.batchId} className="flex justify-between border-b border-border/60 pb-1">
                  <span className="nums text-muted-foreground">{a.batchId.slice(0, 8)}…</span>
                  <span className="nums">{a.allocated}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
