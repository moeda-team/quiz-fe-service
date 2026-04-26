"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";

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

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return { themes, isLoading, error, refreshThemes: fetchThemes };
}
