'use client';
import { LangSwitcher } from '@/components/app-shell/lang-switcher';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-end gap-1 border-b border-border bg-card/60 px-4 backdrop-blur">
      <LangSwitcher />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
