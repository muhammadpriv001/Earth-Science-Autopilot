'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  GitCompare,
  Globe2,
  House,
  Layers,
  LayoutDashboard,
  LogIn,
  LogOut,
  Microscope,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthAndInvestigationContext';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const PUBLIC_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/#vision', label: 'Mission', icon: Globe2 },
  { href: '/#domains', label: 'Domains', icon: Layers },
  { href: '/#science', label: 'Science', icon: Microscope },
  { href: '/dashboard', label: 'Portal', icon: Compass },
];

const PORTAL_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/analysis', label: 'Analysis', icon: TrendingUp },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/forecast', label: 'Forecast', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: User },
];

// Auth pages already expose "Continue as guest", so the pill only needs the
// account routes here — no portal shortcut.
const AUTH_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/auth/sign-in', label: 'Sign In', icon: LogIn },
  { href: '/auth/sign-up', label: 'Register', icon: UserPlus },
];

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.href.includes('#')) return false;
  if (item.href === '/') return pathname === '/';
  if (item.href === '/forecast') {
    return pathname === '/forecast' || pathname === '/prediction';
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const itemBase =
  'group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 py-1.5 transition-all duration-200';

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isLanding = pathname === '/';
  const isAuth = pathname.startsWith('/auth');

  let items: NavItem[];
  if (isLanding) {
    items = PUBLIC_ITEMS.map(item =>
      item.href === '/dashboard'
        ? { ...item, href: user ? '/dashboard' : '/auth/sign-in', label: user ? 'Portal' : 'Sign In' }
        : item
    );
  } else if (isAuth) {
    items = AUTH_ITEMS;
  } else {
    items = PORTAL_ITEMS;
  }

  // A real sign-out control only belongs to the authenticated portal pill.
  const showSignOut = !isLanding && !isAuth && Boolean(user);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav aria-label="Mobile navigation" className="mobile-nav-shell md:hidden">
      <div className="flex items-center justify-between gap-0.5 rounded-full border border-emerald-400/25 bg-[#06211b]/80 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {items.map(item => {
          const Icon = item.icon;
          const active = isItemActive(pathname, item);

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`${itemBase} ${
                active
                  ? 'bg-gradient-to-br from-emerald-400 via-teal-300 to-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'text-emerald-100/70 hover:bg-white/5 hover:text-emerald-100 active:scale-95'
              }`}
            >
              <Icon
                className={`h-[17px] w-[17px] shrink-0 ${active ? 'drop-shadow-sm' : ''}`}
                strokeWidth={active ? 2.6 : 2}
              />
              <span className="max-w-full truncate text-[8px] font-bold leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        {showSignOut && (
          <button
            type="button"
            onClick={handleSignOut}
            className={`${itemBase} text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-200 active:scale-95`}
          >
            <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
            <span className="max-w-full truncate text-[8px] font-bold leading-none tracking-tight">
              Log Out
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
