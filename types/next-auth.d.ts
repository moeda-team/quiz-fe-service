// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

export type UserRole = "admin" | "teacher" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      id: string;
    } & DefaultSession["user"];
    access_token?: string;
  }

  interface User extends DefaultUser {
    role: UserRole;
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    access_token?: string;
  }
}
