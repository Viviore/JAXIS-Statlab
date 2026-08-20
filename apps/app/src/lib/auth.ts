import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { RoleName, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { LoginSchema } from "@/features/auth/schemas";

export type Role = RoleName;

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        });

        if (!user) {
          await db.authAuditLog.create({
            data: {
              email: email.toLowerCase(),
              event: "LOGIN_FAILED",
              metadata: { reason: "USER_NOT_FOUND" },
            },
          });
          return null;
        }

        if (user.status === "SUSPENDED") {
          await db.authAuditLog.create({
            data: {
              userId: user.id,
              email: user.email,
              event: "ACCOUNT_SUSPENDED_BLOCK",
              metadata: { reason: "ACCOUNT_SUSPENDED" },
            },
          });
          throw new Error("ACCOUNT_SUSPENDED");
        }

        if (user.status === "TERMINATED") {
          await db.authAuditLog.create({
            data: {
              userId: user.id,
              email: user.email,
              event: "ACCOUNT_TERMINATED_BLOCK",
              metadata: { reason: "ACCOUNT_TERMINATED" },
            },
          });
          throw new Error("ACCOUNT_TERMINATED");
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          await db.authAuditLog.create({
            data: {
              userId: user.id,
              email: user.email,
              event: "LOGIN_FAILED",
              metadata: { reason: "INVALID_PASSWORD" },
            },
          });
          return null;
        }

        // Primary role resolution (fallback to CLIENT if unassigned)
        const primaryRole: RoleName =
          user.userRoles[0]?.role.name ?? "CLIENT";

        await db.authAuditLog.create({
          data: {
            userId: user.id,
            email: user.email,
            event: "LOGIN_SUCCESS",
            metadata: { role: primaryRole },
          },
        });

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: primaryRole,
          status: user.status as UserStatus,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as RoleName;
        session.user.fullName = token.fullName as string;
        session.user.status = token.status as UserStatus;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.email) {
        const userEmail = message.token.email as string;
        const userId = message.token.id as string | undefined;

        await db.authAuditLog.create({
          data: {
            userId: userId ?? null,
            email: userEmail,
            event: "LOGOUT",
          },
        });
      }
    },
  },
};

const nextAuthInstance = NextAuth(authConfig);

export const handlers = nextAuthInstance.handlers;
export const auth = nextAuthInstance.auth;
export const signIn = nextAuthInstance.signIn;
export const signOut = nextAuthInstance.signOut;

/**
 * Server-side role guard utility.
 * Must be the first check in protected Server Actions and API Route handlers.
 */
export async function requireRole(...roles: RoleName[]) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }

  if (session.user.status === "SUSPENDED") {
    throw new Error("ACCOUNT_SUSPENDED");
  }

  if (session.user.status === "TERMINATED") {
    throw new Error("ACCOUNT_TERMINATED");
  }

  if (roles.length > 0 && !roles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
