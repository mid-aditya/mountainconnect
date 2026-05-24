import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type LoginPayload = {
  user?: {
    id: string;
    email?: string;
    fullName?: string;
    avatar?: string;
    roles?: string[];
  };
  tokens?: {
    accessToken: string;
    refreshToken?: string;
  };
  accessToken?: string;
  access_token?: string;
};

function mapRolesToDashboardRole(roles?: string[]): string {
  if (!roles?.length) return "user";
  const priority = ["admin", "tn_admin", "moderator", "operator", "solo_traveler"];
  for (const role of priority) {
    if (roles.includes(role)) {
      if (role === "solo_traveler") return "user";
      return role;
    }
  }
  return roles[0] === "solo_traveler" ? "user" : roles[0];
}

async function verifyCredentials(email: string, password: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone: email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[NextAuth] Login failed:", res.status, err);
      return null;
    }

    const body = await res.json();
    const payload: LoginPayload = body.data ?? body;
    const user = payload.user;
    const accessToken =
      payload.tokens?.accessToken ??
      payload.accessToken ??
      payload.access_token;

    if (!user?.id || !accessToken) {
      console.error("[NextAuth] Invalid login payload:", payload);
      return null;
    }

    const roles = user.roles || ["solo_traveler"];

    return {
      id: user.id,
      email: user.email ?? email,
      name: user.fullName ?? "User",
      image: user.avatar ?? null,
      accessToken,
      roles,
      role: mapRolesToDashboardRole(roles),
    };
  } catch (error) {
    console.error("[NextAuth] Login error:", error);
    return null;
  }
}

async function doSocialLogin(provider: string, account: { access_token?: string }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        token: account?.access_token,
      }),
    });

    if (!res.ok) return null;

    const body = await res.json();
    const payload: LoginPayload = body.data ?? body;
    const user = payload.user;
    const accessToken =
      payload.tokens?.accessToken ??
      payload.accessToken ??
      payload.access_token;

    if (!user?.id || !accessToken) return null;

    const roles = user.roles || ["solo_traveler"];
    return { user, accessToken, roles, role: mapRolesToDashboardRole(roles) };
  } catch {
    return null;
  }
}

const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const account = await verifyCredentials(
        credentials.email,
        credentials.password,
      );
      if (!account) return null;
      return {
        id: account.id,
        email: account.email,
        name: account.name,
        image: account.image ?? undefined,
        accessToken: account.accessToken,
        roles: account.roles,
        role: account.role,
      } as any;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  );
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as {
          accessToken?: string;
          roles?: string[];
          role?: string;
        };
        if (u.accessToken) token.accessToken = u.accessToken;
        if (u.roles) token.roles = u.roles;
        if (u.role) token.role = u.role;
      }

      if (account?.provider === "google" || account?.provider === "github") {
        const socialResult = await doSocialLogin(account.provider, account);
        if (socialResult) {
          token.accessToken = socialResult.accessToken;
          token.roles = socialResult.roles;
          token.role = socialResult.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { accessToken?: string }).accessToken =
          token.accessToken as string;
        (session.user as { roles?: string[] }).roles = token.roles as string[];
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export default NextAuth(authOptions);
