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
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/products', labelKey: 'nav.products', icon: Package },
  { href: '/reference', labelKey: 'nav.reference', icon: BookMarked, adminOnly: true },
  { href: '/batches', labelKey: 'nav.batches', icon: Layers },
  { href: '/stock', labelKey: 'nav.stock', icon: Boxes },
  { href: '/receipts', labelKey: 'nav.receipts', icon: ArrowDownToLine },
  { href: '/transfers', labelKey: 'nav.transfers', icon: ArrowLeftRight },
  { href: '/write-offs', labelKey: 'nav.writeOffs', icon: ClipboardX },
  { href: '/inventory', labelKey: 'nav.inventory', icon: ClipboardCheck },
  { href: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
  { href: '/notifications', labelKey: 'nav.notifications', icon: Bell },
  { href: '/admin/users', labelKey: 'nav.admin', icon: Users, adminOnly: true },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings, adminOnly: true },
];

export function visibleNav(role: Role | undefined): NavItem[] {
  return NAV.filter((n) => !n.adminOnly || role === Role.ADMIN);
}
