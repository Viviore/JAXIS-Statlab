import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import type { RoleName, UserStatus } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  providers: [],
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
};

const nextAuthEdgeInstance = NextAuth(authConfig);

export const auth = nextAuthEdgeInstance.auth;
