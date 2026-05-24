import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import UserSidebar from './UserSidebar';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, isEndUser } = useAuth();
  const router = useRouter();
  const isUserPortal = router.pathname.startsWith('/user');

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (isEndUser() && router.pathname.startsWith('/dashboard')) {
      router.replace('/user');
      return;
    }
    if (!isEndUser() && isUserPortal) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isEndUser, isUserPortal, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Only show sidebar layout for dashboard routes
  if (!router.pathname.startsWith('/dashboard') &&
      !router.pathname.startsWith('/user') &&
      !router.pathname.startsWith('/operator-portal') &&
      !router.pathname.startsWith('/tn-admin-portal') &&
      !router.pathname.startsWith('/moderation-tools')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isUserPortal ? (
        <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
