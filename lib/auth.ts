// lib/auth.ts
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AdapterUser } from "next-auth/adapters";
import type { UserRole } from "@/types/next-auth";
import { API_BASE_URL } from "./api";

type LoginResponseUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type LoginResponse = {
  data: LoginResponseUser;
  access_token: string;
};

type AppUser = LoginResponseUser & {
  access_token: string;
};

function isAppUser(
  user: User | AdapterUser
): user is User & { role: UserRole; access_token?: string } {
  return "role" in user;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
        const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

        const basicAuth = `Basic ${btoa(`${username}:${password}`)}`;
        console.log(credentials)
        try {
          const res = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": basicAuth,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(
              "[AUTH] Login failed:",
              res.status,
              res.statusText,
              text
            );

            // 401 / 400 → kemungkinan besar email/password salah
            if (res.status === 400 || res.status === 401) {
              return null; // NextAuth → CredentialsSignin
            }

            // status lain → server error, tetap di-anggap gagal login
            return null;
          }

          const data: any = await res.json();
          console.log("[AUTH] Login Response Data:", data);

          // Pastikan kita mengambil token dari tempat yang benar
          const access_token = data.access_token || data.accessToken || data.token || data.data?.access_token || data.data?.token;

          if (!access_token) {
            console.error("[AUTH] No token found in API response");
          }

          const appUser: AppUser = {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            access_token: access_token,
          };

          return appUser;
        } catch (error) {
          console.error("[AUTH] Login exception:", error);
          return null; // tetap CredentialsSignin
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && isAppUser(user)) {
        console.log("[AUTH] JWT Callback - User data:", user);
        token.name = user.name;
        token.email = user.email;
        token.role = user.role ?? "student";
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH] Session Callback - Token data:", token);
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email =
          (token.email as string | undefined) ?? session.user.email;
        session.user.role = token.role ?? "student";
      }
      session.access_token = token.access_token;
      return session;
    },
  },
};
