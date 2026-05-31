'use client';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LangSwitcher } from '@/components/app-shell/lang-switcher';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { CommandPalette, openCommandPalette } from './command-palette';

export function Topbar() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <button
        type="button"
        onClick={openCommandPalette}
        aria-label={t('command.placeholder')}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{t('command.placeholder')}</span>
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 text-[0.6875rem]">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <LangSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
      <CommandPalette />
    </header>
  );
}
