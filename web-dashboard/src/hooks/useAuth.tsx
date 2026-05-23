import type { ComponentType } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

type UserRole = 'admin' | 'operator' | 'tn_admin' | 'moderator' | 'user';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  permissions: string[];
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

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasPermission = (...permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some((p) => user.permissions.includes(p));
  };

  const isAdmin = (): boolean => user?.role === 'admin';
  const isOperator = (): boolean => user?.role === 'operator';
  const isTnAdmin = (): boolean => user?.role === 'tn_admin';
  const isModerator = (): boolean => user?.role === 'moderator';

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
