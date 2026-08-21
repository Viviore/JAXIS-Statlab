import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { RoleName, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { LoginSchema } from "@/features/auth/schemas";
import { DEV_USERS } from "@/lib/mock-data/users.data";

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
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Attempt DB Lookup with offline fallback
        try {
          const user = await db.user.findUnique({
            where: { email: normalizedEmail },
            include: {
              userRoles: {
                include: { role: true },
              },
            },
          });

          if (user) {
            if (user.status === "SUSPENDED") {
              try {
                await db.authAuditLog.create({
                  data: {
                    userId: user.id,
                    email: user.email,
                    event: "ACCOUNT_SUSPENDED_BLOCK",
                    metadata: { reason: "ACCOUNT_SUSPENDED" },
                  },
                });
              } catch (e) {
                void e;
              }
              throw new Error("ACCOUNT_SUSPENDED");
            }

            if (user.status === "TERMINATED") {
              try {
                await db.authAuditLog.create({
                  data: {
                    userId: user.id,
                    email: user.email,
                    event: "ACCOUNT_TERMINATED_BLOCK",
                    metadata: { reason: "ACCOUNT_TERMINATED" },
                  },
                });
              } catch (e) {
                void e;
              }
              throw new Error("ACCOUNT_TERMINATED");
            }

            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
              try {
                await db.authAuditLog.create({
                  data: {
                    userId: user.id,
                    email: user.email,
                    event: "LOGIN_FAILED",
                    metadata: { reason: "INVALID_PASSWORD" },
                  },
                });
              } catch (e) {
                void e;
              }
              return null;
            }

            const primaryRole: RoleName =
              user.userRoles[0]?.role.name ?? "CLIENT";

            try {
              await db.authAuditLog.create({
                data: {
                  userId: user.id,
                  email: user.email,
                  event: "LOGIN_SUCCESS",
                  metadata: { role: primaryRole },
                },
              });
            } catch (e) {
              void e;
            }

            return {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: primaryRole,
              status: user.status as UserStatus,
            };
          }
        } catch (dbError) {
          // If DB is offline/unreachable, fallback to DEV_USERS
          console.warn("[Auth] Live DB unreachable or offline. Checking DEV_USERS fallback.", dbError);
        }

        // 2. Development Quick Credentials Fallback (Offline Mode)
        const devUser = DEV_USERS[normalizedEmail];
        if (devUser) {
          if (devUser.status === "SUSPENDED") {
            throw new Error("ACCOUNT_SUSPENDED");
          }
          if (devUser.status === "TERMINATED") {
            throw new Error("ACCOUNT_TERMINATED");
          }

          if (devUser.password === password) {
            return {
              id: devUser.id,
              email: devUser.email,
              fullName: devUser.fullName,
              role: devUser.role,
              status: devUser.status,
            };
          }
        }

        return null;
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

        try {
          await db.authAuditLog.create({
            data: {
              userId: userId ?? null,
              email: userEmail,
              event: "LOGOUT",
            },
          });
        } catch (e) {
          void e;
        }
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
