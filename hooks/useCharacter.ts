"use client";

import { useState, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { getErrorMessage, ErrorType } from "@/types/common";

export interface Character {
  id: string;
  name: string;
  profileImage: string;
  fullImage: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}


export function useCharacters(searchQuery: string = "") {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);

  const fetchCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<{ data: Character[] }>("/profile-characters");
      const charactersData = Array.isArray(response) ? response : (response.data || []);
      setCharacters(charactersData);
      return charactersData;
    } catch (err: ErrorType) {
      console.error("Failed to fetch characters:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { characters, fetchCharacters, isLoading, error };
}
