import { Role } from '@app/shared';
import {
  LayoutDashboard,
  Package,
  BookMarked,
  Boxes,
  Layers,
  ArrowDownToLine,
  ArrowLeftRight,
  ClipboardX,
  ClipboardCheck,
  BarChart3,
  Bell,
  Users,
  Settings,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'navGroups.overview',
    items: [
      { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { href: '/notifications', labelKey: 'nav.notifications', icon: Bell },
      { href: '/guide', labelKey: 'nav.guide', icon: BookOpen },
    ],
  },
  {
    labelKey: 'navGroups.stock',
    items: [
      { href: '/stock', labelKey: 'nav.stock', icon: Boxes },
      { href: '/batches', labelKey: 'nav.batches', icon: Layers },
    ],
  },
  {
    labelKey: 'navGroups.operations',
    items: [
      { href: '/receipts', labelKey: 'nav.receipts', icon: ArrowDownToLine },
      { href: '/transfers', labelKey: 'nav.transfers', icon: ArrowLeftRight },
      { href: '/write-offs', labelKey: 'nav.writeOffs', icon: ClipboardX },
      { href: '/inventory', labelKey: 'nav.inventory', icon: ClipboardCheck },
    ],
  },
  {
    labelKey: 'navGroups.analytics',
    items: [{ href: '/reports', labelKey: 'nav.reports', icon: BarChart3 }],
  },
  {
    labelKey: 'navGroups.catalog',
    items: [
      { href: '/products', labelKey: 'nav.products', icon: Package },
      { href: '/reference', labelKey: 'nav.reference', icon: BookMarked, adminOnly: true },
    ],
  },
  {
    labelKey: 'navGroups.administration',
    items: [
      { href: '/admin/users', labelKey: 'nav.admin', icon: Users, adminOnly: true },
      { href: '/settings', labelKey: 'nav.settings', icon: Settings, adminOnly: true },
    ],
  },
];

export function visibleNavGroups(role: Role | undefined): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || role === Role.ADMIN),
  })).filter((group) => group.items.length > 0);
}
