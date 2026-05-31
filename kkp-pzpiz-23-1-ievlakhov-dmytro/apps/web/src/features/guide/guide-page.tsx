'use client';
import {
  Package,
  ArrowDownToLine,
  Boxes,
  ArrowLeftRight,
  ClipboardX,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/data/status-badge';
import { PageHeader } from '@/components/data/page-header';
import { NAV_GROUPS } from '@/components/app-shell/nav';

type Lang = 'uk' | 'en';
const tx = (l: Lang, uk: string, en: string) => (l === 'en' ? en : uk);

/** Short purpose of each route, keyed by href. */
const PAGE_DOCS: Record<string, { uk: string; en: string; star?: boolean }> = {
  '/dashboard': {
    uk: 'Зведення складу: кількість критичних залишків, партій із близьким терміном і останні списання.',
    en: 'Warehouse overview: critical-stock count, near-expiry batches and the latest write-offs.',
  },
  '/notifications': {
    uk: 'Сигнали системи про низькі залишки та близькі терміни придатності; можна позначати прочитаними.',
    en: 'System alerts for low stock and near-expiry; mark them read individually or all at once.',
  },
  '/guide': {
    uk: 'Ця сторінка — як користуватися платформою.',
    en: 'This page — how to use the platform.',
  },
  '/stock': {
    uk: 'Поточні залишки по партіях і локаціях, картка критичних залишків та FEFO-підказка (що списувати першим).',
    en: 'Current quantities by batch and location, a critical-stock card and a FEFO suggestion (what to consume first).',
  },
  '/batches': {
    uk: 'Усі партії товарів зі строками придатності та позначками «близький термін»/«прострочено».',
    en: 'All product batches with expiry dates and near-expiry / expired markers.',
  },
  '/receipts': {
    uk: 'Оприбуткування товару від постачальників. Кожен рядок створює партію зі строком, ціною та валютою — і збільшує залишок.',
    en: 'Goods receipts from suppliers. Each line creates a batch with expiry, cost and currency — and increases stock.',
  },
  '/transfers': {
    uk: 'Переміщення партій між локаціями складу (напр., із сухого складу в холодильник).',
    en: 'Move batches between storage locations (e.g. from the dry store to the fridge).',
  },
  '/write-offs': {
    uk: 'Списання запасів з ОБОВ’ЯЗКОВОЮ причиною (псування, бій, перевиробництво…). FEFO-підказка підставляє партії автоматично.',
    en: 'Write-offs with a MANDATORY reason (spoilage, breakage, overproduction…). The FEFO helper fills batches automatically.',
    star: true,
  },
  '/inventory': {
    uk: 'Перерахунок фактичних залишків. Після «Завершити» система сама коригує облік і фіксує недостачі/надлишки.',
    en: 'Physical recount. On “Complete”, the system adjusts the book stock and records shortages/surpluses.',
    star: true,
  },
  '/reports': {
    uk: 'Структура втрат за причинами (графік + суми у базовій валюті) та звіт по інвентаризації.',
    en: 'Loss structure by reason (chart + totals in the base currency) and an inventory report.',
    star: true,
  },
  '/products': {
    uk: 'Довідник товарів: одиниця виміру, категорія та мінімальний залишок (поріг для сигналів).',
    en: 'Product catalogue: unit of measure, category and minimum stock (the alert threshold).',
  },
  '/reference': {
    uk: 'Довідники: категорії, одиниці виміру, постачальники та локації зберігання.',
    en: 'Reference data: categories, units, suppliers and storage locations.',
  },
  '/admin/users': {
    uk: 'Керування обліковими записами: створення, ролі, деактивація та анонімізація (лише адміністратор).',
    en: 'User account management: create, roles, deactivation and anonymization (admin only).',
  },
  '/settings': {
    uk: 'Параметри системи, валюти й курси, резервні копії та експорт/імпорт довідників (лише адміністратор).',
    en: 'System parameters, currencies & rates, backups and reference export/import (admin only).',
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight">{children}</h2>;
}

export function GuidePage() {
  const { t, i18n } = useTranslation();
  const l: Lang = i18n.language === 'en' ? 'en' : 'uk';

  const lifecycle = [
    { icon: Package, label: tx(l, 'Номенклатура', 'Product'), note: tx(l, 'товар у каталозі', 'item in the catalogue') },
    { icon: ArrowDownToLine, label: tx(l, 'Приймання', 'Receipt'), note: tx(l, 'створює партію', 'creates a batch') },
    { icon: Boxes, label: tx(l, 'Залишок', 'Stock'), note: tx(l, 'партія на локації', 'batch at a location') },
    {
      icon: ArrowLeftRight,
      label: tx(l, 'Рух', 'Movement'),
      note: tx(l, 'переміщення / списання ★ / інвентаризація ★', 'transfer / write-off ★ / inventory ★'),
    },
    { icon: BarChart3, label: tx(l, 'Аналітика', 'Analytics'), note: tx(l, 'звіт втрат ★', 'loss report ★') },
  ];

  const scenarios = [
    {
      title: tx(l, 'Прийняти товар', 'Receive goods'),
      steps: tx(
        l,
        'Приймання → «Нове приймання» → постачальник, локація, дата → додайте рядки (товар, № партії, строк, кількість, ціна, валюта) → Зберегти. Партія і залишок створюються автоматично.',
        'Receipts → “New receipt” → supplier, location, date → add lines (product, batch no., expiry, quantity, cost, currency) → Save. The batch and stock are created automatically.',
      ),
    },
    {
      title: tx(l, 'Списати зіпсоване ★', 'Write off spoilage ★'),
      steps: tx(
        l,
        'Списання → «Нове списання» → оберіть причину (обов’язково) → у блоці FEFO виберіть товар, локацію й кількість → «Заповнити» підставить партії за строком → Зберегти.',
        'Write-offs → “New write-off” → pick a reason (required) → in the FEFO block choose product, location and quantity → “Fill” inserts batches by expiry → Save.',
      ),
    },
    {
      title: tx(l, 'Перемістити між локаціями', 'Move between locations'),
      steps: tx(
        l,
        'Переміщення → «Нове переміщення» → звідки та куди (різні локації) → додайте партії й кількість → Зберегти.',
        'Transfers → “New transfer” → from and to (different locations) → add batches and quantity → Save.',
      ),
    },
    {
      title: tx(l, 'Провести інвентаризацію ★', 'Run an inventory ★'),
      steps: tx(
        l,
        'Інвентаризація → «Нова» → оберіть локацію → впишіть фактичні кількості (розбіжність підсвічується) → «Завершити». Облік скоригується, недостачі/надлишки потраплять у звіт.',
        'Inventory → “New” → choose a location → enter actual quantities (the discrepancy is highlighted) → “Complete”. Book stock is adjusted and shortages/surpluses appear in the report.',
      ),
    },
    {
      title: tx(l, 'Проаналізувати втрати ★', 'Analyse losses ★'),
      steps: tx(
        l,
        'Звіти → вкладка «Структура втрат» → виберіть період → «Сформувати». Побачите графік і суми втрат за причинами у базовій валюті.',
        'Reports → “Loss structure” tab → pick a date range → “Build”. You get a chart and loss totals by reason in the base currency.',
      ),
    },
    {
      title: tx(l, 'Виправити помилку', 'Fix a mistake'),
      steps: tx(
        l,
        'Відкрийте документ за його номером → «Сторнувати». Рух залишків відкотиться, а документ залишиться в історії (для аудиту не видаляється).',
        'Open a document by its number → “Reverse”. The stock movement is rolled back while the document stays in history (kept for audit, not deleted).',
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={tx(l, 'Як користуватися системою', 'How to use the system')}
        description={tx(
          l,
          'Складський облік для закладу громадського харчування: приймання, рух, контроль термінів і аналітика втрат.',
          'Warehouse accounting for a catering establishment: receiving, movement, expiry control and loss analytics.',
        )}
      />

      {/* Lifecycle */}
      <SectionTitle>{tx(l, 'Життєвий цикл товару', 'Product lifecycle')}</SectionTitle>
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
            {lifecycle.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center gap-3 md:flex-col md:text-center">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-muted/40 p-3 md:w-full md:flex-col md:gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">{s.note}</span>
                  </span>
                </div>
                {i < lifecycle.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground md:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Star / unique part */}
      <SectionTitle>{tx(l, 'Що робить систему особливою ★', 'What makes the system special ★')}</SectionTitle>
      <Card className="border-primary/30 bg-accent/40">
        <CardContent className="space-y-2 p-5 text-sm">
          <div className="flex items-center gap-2 font-medium text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            {tx(l, 'Контроль і аналітика втрат', 'Loss control & analytics')}
          </div>
          <ul className="ml-1 list-inside list-disc space-y-1 text-foreground/90">
            <li>
              {tx(
                l,
                'Кожне списання вимагає причини — нічого не зникає «просто так».',
                'Every write-off requires a reason — nothing disappears “just like that”.',
              )}
            </li>
            <li>
              {tx(
                l,
                'Інвентаризація автоматично виявляє розбіжності й коригує облік.',
                'Inventory automatically detects discrepancies and corrects the book stock.',
              )}
            </li>
            <li>
              {tx(
                l,
                'Звіт «Структура втрат» показує, на чому й скільки втрачає заклад.',
                'The “Loss structure” report shows where and how much the establishment loses.',
              )}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Document statuses */}
      <SectionTitle>{tx(l, 'Стани документів', 'Document states')}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              {tx(l, 'Приймання · Переміщення · Списання', 'Receipts · Transfers · Write-offs')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <StatusBadge tone="active">{tx(l, 'Проведено', 'Posted')}</StatusBadge>
              <ArrowRight className="h-3.5 w-3.5" />
              <StatusBadge tone="archived">{tx(l, 'Сторновано', 'Reversed')}</StatusBadge>
            </div>
            <p>
              {tx(
                l,
                'Документ проводиться одразу. Помилку виправляють сторнуванням — рух відкочується, запис лишається в історії.',
                'A document is posted immediately. Mistakes are fixed by reversal — the movement is rolled back, the record stays in history.',
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              {tx(l, 'Інвентаризація', 'Inventory')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <StatusBadge tone="warning">{tx(l, 'Чернетка', 'Draft')}</StatusBadge>
              <ArrowRight className="h-3.5 w-3.5" />
              <StatusBadge tone="active">{tx(l, 'Завершено', 'Completed')}</StatusBadge>
            </div>
            <p>
              {tx(
                l,
                'Поки чернетка — вводимо факт. Після «Завершити» залишки коригуються й документ закривається.',
                'While a draft — enter actuals. After “Complete”, stock is adjusted and the document is closed.',
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles */}
      <SectionTitle>{tx(l, 'Ролі користувачів', 'User roles')}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              {tx(l, 'Користувач', 'User')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tx(
              l,
              'Усі складські операції: приймання, переміщення, списання, інвентаризація; перегляд залишків, звітів і сповіщень.',
              'All warehouse operations: receiving, transfers, write-offs, inventory; viewing stock, reports and notifications.',
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {tx(l, 'Адміністратор', 'Administrator')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tx(
              l,
              'Усе, що може користувач, плюс довідники, користувачі, валюти/курси та налаштування системи.',
              'Everything a user can do, plus reference data, users, currencies/rates and system settings.',
            )}
          </CardContent>
        </Card>
      </div>

      {/* Page reference, grouped like the sidebar */}
      <SectionTitle>{tx(l, 'Призначення сторінок', 'What each page does')}</SectionTitle>
      <div className="space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey}>
            <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.labelKey)}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => {
                const doc = PAGE_DOCS[item.href];
                const Icon = item.icon;
                return (
                  <Card key={item.href}>
                    <CardContent className="flex gap-3 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{t(item.labelKey)}</span>
                          {doc?.star && (
                            <span className="text-xs font-medium text-primary" title="★">
                              ★
                            </span>
                          )}
                          {item.adminOnly && (
                            <StatusBadge tone="info">{tx(l, 'адмін', 'admin')}</StatusBadge>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {doc ? tx(l, doc.uk, doc.en) : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <SectionTitle>{tx(l, 'Типові сценарії', 'Common scenarios')}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {scenarios.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">{s.steps}</CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        {tx(
          l,
          'Порада: натисніть ⌘K (Ctrl+K) будь-де, щоб швидко перейти на потрібну сторінку.',
          'Tip: press ⌘K (Ctrl+K) anywhere to quickly jump to any page.',
        )}
      </p>
    </div>
  );
}
