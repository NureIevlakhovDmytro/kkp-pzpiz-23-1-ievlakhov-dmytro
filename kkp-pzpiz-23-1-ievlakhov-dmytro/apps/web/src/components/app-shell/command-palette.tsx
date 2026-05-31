'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { visibleNavGroups, type NavItem } from './nav';

const OPEN_EVENT = 'open-command';

interface FlatItem extends NavItem {
  groupKey: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<FlatItem[]>(
    () =>
      visibleNavGroups(user?.role).flatMap((group) =>
        group.items.map((item) => ({ ...item, groupKey: group.labelKey })),
      ),
    [user?.role],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const label = t(item.labelKey).toLowerCase();
      const group = t(item.groupKey).toLowerCase();
      return label.includes(q) || group.includes(q) || item.href.toLowerCase().includes(q);
    });
  }, [items, query, t]);

  // Global ⌘K / Ctrl+K listener and topbar trigger event.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Reset query and highlight whenever the palette opens.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  // Keep the highlighted index within bounds as the list shrinks.
  useEffect(() => {
    setActive((prev) => (prev >= filtered.length ? Math.max(filtered.length - 1, 0) : prev));
  }, [filtered.length]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((prev) => (filtered.length === 0 ? 0 : (prev + 1) % filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((prev) => (filtered.length === 0 ? 0 : (prev - 1 + filtered.length) % filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[active];
      if (item) go(item.href);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{t('command.placeholder')}</DialogTitle>
        <div className="border-b border-border p-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={t('command.placeholder')}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label={t('command.placeholder')}
          />
        </div>
        <div ref={listRef} className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t('command.empty')}</p>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    i === active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{t(item.labelKey)}</span>
                  <span className="text-xs text-muted-foreground">{t(item.groupKey)}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-end gap-1 border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <kbd className="rounded border border-border bg-muted px-1.5 text-[0.6875rem]">↑↓</kbd>
          <span>{t('command.hint')}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}
