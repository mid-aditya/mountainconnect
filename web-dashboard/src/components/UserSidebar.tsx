import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import {
  HomeIcon,
  MapIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAsiaAustraliaIcon as MountainIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Beranda', href: '/user', icon: <HomeIcon className="w-5 h-5" /> },
  { label: 'Trip Saya', href: '/user/trips', icon: <MapIcon className="w-5 h-5" /> },
  { label: 'Profil', href: '/user/profile', icon: <UserCircleIcon className="w-5 h-5" /> },
  { label: 'Darurat', href: '/user/emergency', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
  { label: 'Pengaturan', href: '/user/settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
];

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function UserSidebar({ open, onClose }: UserSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === '/user'
      ? router.pathname === '/user'
      : router.pathname === href || router.pathname.startsWith(href + '/');

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className={clsx('flex items-center h-16 px-6 border-b border-gray-100', collapsed && 'justify-center px-0')}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <MountainIcon className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">MountainConnect</p>
              <p className="text-xs text-gray-500 truncate">Pendaki</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-secondary-50 text-secondary-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <span className={clsx('flex-shrink-0', active ? 'text-secondary-600' : 'text-gray-400')}>
                {item.icon}
              </span>
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={clsx('border-t border-gray-100 p-4', collapsed && 'px-2')}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-secondary-700">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">Pendaki</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-colors w-full',
            collapsed && 'justify-center',
          )}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
