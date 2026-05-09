// Common types used throughout the application

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Generic error type for catch blocks
export type ErrorType = Error | ApiError | { message: string } | unknown;

// Helper function to extract error message
export function getErrorMessage(error: ErrorType): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as ApiError;
    return err.message || (err.details?.message as string) || 'An error occurred';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

// Base entity interface
export interface BaseEntity {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

// Generic create/update data type
export type CreateData<T = Record<string, unknown>> = {
  [K in keyof T]: T[K];
};

export type UpdateData<T = Record<string, unknown>> = {
  [K in keyof T]?: T[K];
};

// Dynamic object type for flexible API responses
export interface DynamicObject {
  [key: string]: unknown;
}
