// lib/api.ts
import { getSession } from "next-auth/react";

interface QuestionData {
  quizId: string;
  order: number;
  text: string;
  type: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE";
  timeLimit?: number;
  imageUrl?: string;
  musicFile?: string;
  correctAnswer?: string;
  answers?: Array<{
    text: string;
    isCorrect: boolean;
    points: number;
  }>;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-quiz.hompimpa.biz.id";

const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

const basicAuth = `Basic ${btoa(`${username}:${password}`)}`;

export async function getAuthHeader() {
  // Try to get session (works on client side)
  try {
    const session = await getSession();
    if (session?.access_token) {
      return `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn("[API] Failed to get session, falling back to Basic Auth", err);
  }
  return basicAuth;
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized - redirecting to login");
    }
    
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

export async function apiGet<T>(
  path: string
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
  });

  if (!res.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized - redirecting to login");
    }
    
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
export async function apiPut<T>(
  path: string,
  body: unknown
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized - redirecting to login");
    }
    
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

export async function apiPatch<T>(
  path: string,
  body: unknown
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized - redirecting to login");
    }
    
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

export async function apiDelete<T>(
  path: string
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
  });

  if (!res.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized - redirecting to login");
    }
    
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

// Question API functions
export async function createQuestion(questionData: QuestionData): Promise<QuestionData> {
  return apiPost("/questions", questionData);
}

export async function getQuestions(quizId: string): Promise<QuestionData[]> {
  return apiGet(`/questions?quizId=${quizId}`);
}

export async function getQuestionById(id: string): Promise<QuestionData> {
  return apiGet(`/questions/${id}`);
}

export async function updateQuestion(id: string, questionData: Partial<QuestionData>): Promise<QuestionData> {
  return apiPut(`/questions/${id}`, questionData);
}

export async function deleteQuestion(id: string): Promise<void> {
  return apiDelete(`/questions/${id}`);
}
