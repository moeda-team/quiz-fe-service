// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

export type UserRole = "admin" | "teacher" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    role: UserRole;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    accessToken?: string;
  }
}
