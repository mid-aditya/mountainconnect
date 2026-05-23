import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function verifyCredentials(email: string, password: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone: email, password }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

async function doSocialLogin(provider: string, account: any, profile: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        accessToken: account?.access_token,
        profile,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await verifyCredentials(
          credentials.email,
          credentials.password,
        );

        if (!result) return null;

        return {
          id: result.user?.id || result.id,
          email: result.user?.email || result.email,
          name: result.user?.fullName || result.fullName,
          image: result.user?.avatar || result.avatar,
          accessToken: result.accessToken || result.access_token,
          roles: result.user?.roles || result.roles || ["solo_traveler"],
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.roles = (user as any).roles || ["solo_traveler"];
      }

      if (account?.provider === "google" || account?.provider === "github") {
        const socialResult = await doSocialLogin(
          account.provider,
          account,
          profile,
        );
        if (socialResult) {
          token.accessToken =
            socialResult.accessToken || socialResult.access_token;
          token.roles = socialResult.user?.roles ||
            socialResult.roles || ["solo_traveler"];
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).roles = token.roles;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export default NextAuth(authOptions);
