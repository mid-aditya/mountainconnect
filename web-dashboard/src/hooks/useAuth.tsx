import type { ComponentType } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getPostLoginPath, normalizeRole } from '@/lib/auth-routes';

type UserRole = 'admin' | 'operator' | 'tn_admin' | 'moderator' | 'user';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: UserRole;
  roles?: string[];
  permissions?: string[];
  accessToken?: string;
}

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user as AuthUser | undefined;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const userRoles = (): string[] => {
    if (!user) return [];
    const raw = user.roles?.length ? user.roles : user.role ? [user.role] : [];
    return raw.map(normalizeRole);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    const current = userRoles();
    return roles.some((r) => current.includes(r));
  };

  const isEndUser = (): boolean => {
    const current = userRoles();
    return current.includes('user') && !isAdmin() && !isOperator() && !isTnAdmin() && !isModerator();
  };

  const homePath = (): string =>
    getPostLoginPath(user?.roles, user?.role);

  const hasPermission = (...permissions: string[]): boolean => {
    if (!user?.permissions?.length) return false;
    return permissions.some((p) => user.permissions!.includes(p));
  };

  const isAdmin = (): boolean => userRoles().includes('admin');
  const isOperator = (): boolean => userRoles().includes('operator');
  const isTnAdmin = (): boolean => userRoles().includes('tn_admin');
  const isModerator = (): boolean => userRoles().includes('moderator');

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasPermission,
    isAdmin,
    isOperator,
    isTnAdmin,
    isModerator,
    isEndUser,
    homePath,
    updateSession: update,
  };
}

export function requireAuth(roles?: UserRole[]) {
  return function withAuth(PageComponent: ComponentType) {
    const AuthenticatedComponent = (props: Record<string, unknown>) => {
      const { isAuthenticated, isLoading, hasRole } = useAuth();
      const router = useRouter();

      if (isLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
          </div>
        );
      }

      if (!isAuthenticated) {
        router.replace('/');
        return null;
      }

      if (roles && !hasRole(...roles)) {
        router.replace('/dashboard');
        return null;
      }

      return <PageComponent {...props} />;
    };

    return AuthenticatedComponent;
  };
}
