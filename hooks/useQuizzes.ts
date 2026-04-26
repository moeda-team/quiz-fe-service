"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "@/lib/api";

export interface Quiz {
  id: string | number;
  title: string;
  questions: number | any[];
  author?: string;
  coverImage?: string;
}

export function useQuizzes(searchQuery: string = "") {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizzes = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      if (append) setIsFetchingMore(true);
      else setIsLoading(true);
      
      setError(null);

      // Construct URL with params
      let url = `/quizzes?page=${pageNum}&limit=10`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiGet<{ data: any[], meta?: any }>(url);
      
      const mappedData = response.data.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        questions: Array.isArray(item.questions) ? item.questions.length : (item.total_questions || 0),
        author: item.author || item.creator?.name || "Admin",
        coverImage: item.coverImage || item.image || "/images/bali-culture.jpg",
      }));

      if (append) {
        setQuizzes(prev => [...prev, ...mappedData]);
      } else {
        setQuizzes(mappedData);
      }

      // Check if there's more data
      // If the API returns meta.hasMore or similar, use it. 
      // Otherwise, assume more if we got 10 items.
      const hasMoreData = mappedData.length === 10;
      setHasMore(hasMoreData);
      
    } catch (err: any) {
      console.error("Failed to fetch quizzes:", err);
      setError(err.message || "Gagal mengambil data kuis");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // Initial fetch and search
  useEffect(() => {
    setPage(1);
    fetchQuizzes(1, searchQuery, false);
  }, [searchQuery, fetchQuizzes]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuizzes(nextPage, searchQuery, true);
  }, [hasMore, isLoading, isFetchingMore, page, searchQuery, fetchQuizzes]);

  return { quizzes, isLoading, isFetchingMore, error, hasMore, loadMore };
}
