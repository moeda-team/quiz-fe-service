"use client";

import { useState, useEffect, useCallback } from "react";
import { getErrorMessage, ErrorType } from "@/types/common";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export interface Theme {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  musicFile?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  data?: T;
}

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<{ data: Theme[] }>("/themes");
      // If the API returns { data: [...] }, use it, otherwise check if it's just an array
      const themesData = Array.isArray(response) ? response : (response.data || []);
      setThemes(themesData);
    } catch (err: ErrorType) {
      console.error("Failed to fetch themes:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTheme = useCallback(async (data: Partial<Theme>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPost<Theme | ApiResponse<Theme>>("/themes", data);
      // Handle both direct response and wrapped response
      let themeData: Theme;
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        themeData = response.data;
      } else if (response && typeof response === 'object' && 'id' in response) {
        themeData = response as Theme;
      } else {
        throw new Error("Invalid theme response from API");
      }
      setThemes((prev: Theme[]) => [...prev, themeData]);
      return themeData;
    } catch (err: ErrorType) {
      console.error("Failed to add theme:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTheme = useCallback(async (id: string, data: Partial<Theme>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPatch<Theme>(`/themes/${id}`, data);
      setThemes((prev: Theme[]) => prev.map((t: Theme) => (t.id === id ? response : t)));
      return response;
    } catch (err: ErrorType) {
      console.error("Failed to update theme:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTheme = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiDelete(`/themes/${id}`);
      setThemes((prev: Theme[]) => prev.filter((t: Theme) => t.id !== id));
    } catch (err: ErrorType) {
      console.error("Failed to delete theme:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadThemes = async () => {
      await fetchThemes();
    };
    loadThemes();
  }, []);

  return { themes, isLoading, error, refreshThemes: fetchThemes, addTheme, updateTheme, deleteTheme };
}
