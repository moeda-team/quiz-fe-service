"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export interface Theme {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
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
    } catch (err: any) {
      console.error("Failed to fetch themes:", err);
      setError(err.message || "Gagal mengambil data tema");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTheme = useCallback(async (data: Partial<Theme>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPost<Theme>("/themes", data);
      setThemes(prev => [...prev, response]);
      return response;
    } catch (err: any) {
      console.error("Failed to add theme:", err);
      setError(err.message || "Gagal menambah tema");
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
      setThemes(prev => prev.map(t => (t.id === id ? response : t)));
      return response;
    } catch (err: any) {
      console.error("Failed to update theme:", err);
      setError(err.message || "Gagal memperbarui tema");
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
      setThemes(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error("Failed to delete theme:", err);
      setError(err.message || "Gagal menghapus tema");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return { themes, isLoading, error, refreshThemes: fetchThemes, addTheme, updateTheme, deleteTheme };
}
