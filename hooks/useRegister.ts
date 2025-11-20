// app/hooks/useRegister.ts
"use client";

import { useCallback, useState } from "react";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterResult = {
  ok: boolean;
  message?: string;
};

const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

const basicAuth = `Basic ${btoa(`${username}:${password}`)}`;

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async ({ name, email, password, confirmPassword }: RegisterPayload): Promise<RegisterResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/users/sign/up`, {
          method: "POST",
          headers: {
            "Authorization": basicAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const message =
            data?.message ?? "Something went wrong. Please try again.";
          setError(message);
          return { ok: false, message };
        }

        return { ok: true, message: data?.message };
      } catch (err) {
        console.error("[REGISTER_HOOK_ERROR]", err);
        const message = "Network error. Please try again.";
        setError(message);
        return { ok: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    register,     // fungsi untuk hit API
    isLoading,    // state loading
    error,        // pesan error dari API / network
    resetError,   // kalau mau clear error manual
  };
}
