// lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

const basicAuth = `Basic ${btoa(`${username}:${password}`)}`;

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { 
      "Authorization": basicAuth,
      "Content-Type": "application/json"
     },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
