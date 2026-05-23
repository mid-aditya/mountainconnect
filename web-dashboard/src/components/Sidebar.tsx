import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAsiaAustraliaIcon as MountainIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
  { label: 'Users', href: '/dashboard/users', icon: <UsersIcon className="w-5 h-5" />, roles: ['admin', 'moderator'] },
  { label: 'Mountains', href: '/dashboard/mountains', icon: <MapIcon className="w-5 h-5" />, roles: ['admin', 'tn_admin'] },
  { label: 'Emergency', href: '/dashboard/emergency', icon: <ExclamationTriangleIcon className="w-5 h-5" />, roles: ['admin', 'tn_admin'] },
  { label: 'Marketplace', href: '/dashboard/marketplace', icon: <ShoppingBagIcon className="w-5 h-5" />, roles: ['admin', 'moderator'] },
  { label: 'Analytics', href: '/dashboard/analytics', icon: <ChartBarIcon className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Settings', href: '/dashboard/settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const { user, hasRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/');

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(...(item.roles as any));
  });

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center h-16 px-6 border-b border-gray-100', collapsed && 'justify-center px-0')}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <MountainIcon className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">MountainConnect</p>
              <p className="text-xs text-gray-500 truncate">Admin Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative group',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className={clsx('flex-shrink-0', active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600')}>
                {item.icon}
              </span>
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {active && !collapsed && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className={clsx('border-t border-gray-100 p-4', collapsed && 'px-2')}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-colors w-full',
            collapsed && 'justify-center'
          )}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
