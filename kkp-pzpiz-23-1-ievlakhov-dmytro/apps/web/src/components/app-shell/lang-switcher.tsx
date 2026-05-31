'use client';
import { useTranslation } from 'react-i18next';
import { Locale } from '@app/shared';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api-client';

export function LangSwitcher() {
  const { i18n } = useTranslation();
  async function set(lang: Locale) {
    await i18n.changeLanguage(lang);
    localStorage.setItem('warehouse.lang', lang);
    try {
      await apiFetch('/auth/me', { method: 'PATCH', body: { locale: lang } });
    } catch {
      /* non-blocking: UI language already changed locally */
    }
  }
  return (
    <div className="flex items-center rounded-md border border-border text-xs">
      {[Locale.UK, Locale.EN].map((l) => (
        <Button
          key={l}
          variant={i18n.language === l ? 'default' : 'ghost'}
          size="sm"
          className="h-7 rounded-sm px-2 uppercase"
          onClick={() => void set(l)}
        >
          {l}
        </Button>
      ))}
    </div>
  );
}
