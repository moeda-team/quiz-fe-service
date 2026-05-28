"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import { getErrorMessage, ErrorType, PaginatedResponse, CreateData, UpdateData } from "@/types/common";
import { Quiz as QuizType, QuizQuestion, QuizApiResponse, QuizDynamicResponse, QuizCreateData, QuizResponse, QuizHistory, QuizHistoryDetail } from "@/types/quiz";

export interface Quiz {
  id: string | number;
  title: string;
  name?: string;
  questions: number | QuizQuestion[];
  author?: string;
  coverImage?: string;
  image?: string;
  cover_image?: string;
  description?: string;
  instructions?: string;
  musicFile?: string;
  music_file?: string;
  themeId?: string;
  theme_id?: string;
}

export function useQuizzes(searchQuery: string = "") {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuizzes = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      if (append) setIsFetchingMore(true);
      else setIsLoading(true);

      setError(null);

      // Construct URL with params
      let url = `/quizzes?page=${pageNum}&limit=8`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiGet<PaginatedResponse<QuizDynamicResponse>>(url);

      const mappedData = response.data.map((item: QuizDynamicResponse) => ({
        id: item.id,
        title: item.title || item.name || "",
        questions: Array.isArray(item.questions) ? item.questions.length : (item.total_questions || 0),
        author: item.author || item.creator?.name || "Admin",
        coverImage: item.coverImage || item.image || "/images/bali-culture.jpg",
      }));

      if (append) {
        setQuizzes((prev: Quiz[]) => [...prev, ...mappedData]);
      } else {
        setQuizzes(mappedData);
      }

      // Check if there's more data
      // If the API returns meta.hasMore or similar, use it. 
      // Otherwise, assume more if we got 8 items.
      const hasMoreData = mappedData.length === 8;
      setHasMore(hasMoreData);

    } catch (err: ErrorType) {
      console.error("Failed to fetch quizzes:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // Initial fetch and search
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await fetchQuizzes(1, searchQuery, false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [searchQuery, fetchQuizzes]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuizzes(nextPage, searchQuery, true);
  }, [hasMore, isLoading, isFetchingMore, page, searchQuery, fetchQuizzes]);

  const createQuiz = useCallback(async (data: QuizCreateData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPost<QuizResponse>("/quizzes", data);
      return response.data;
    } catch (err: ErrorType) {
      console.error("Failed to create quiz:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuiz = useCallback(async (id: string | number, data: UpdateData<QuizType>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPatch(`/quizzes/${id}`, data);
      return response;
    } catch (err: ErrorType) {
      console.error("Failed to update quiz:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteQuiz = useCallback(async (id: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiDelete(`/quizzes/${id}`);
      setQuizzes((prev: Quiz[]) => prev.filter((q: Quiz) => q.id !== id));
    } catch (err: ErrorType) {
      console.error("Failed to delete quiz:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const patchQuiz = useCallback(async (id: string | number, data: UpdateData<QuizType>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPatch(`/quizzes/${id}`, data);
      return response;
    } catch (err: ErrorType) {
      console.error("Failed to patch quiz:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getQuizById = useCallback(async (id: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<{ data?: Quiz } | Quiz>(`/quizzes/${id}`);
      // Handle both possible response formats
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    } catch (err: ErrorType) {
      console.error("Failed to fetch quiz details:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (quizId: string): Promise<QuizHistory[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<{ data: QuizHistory[] }>(`/quiz-sessions?quizId=${quizId}`);
      return response.data;
    } catch (err: ErrorType) {
      console.error("Failed to fetch quiz history:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHistoryDetail = useCallback(async (sessionId: string): Promise<QuizHistoryDetail> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<{ data: QuizHistoryDetail }>(`/quiz-sessions/${sessionId}/leaderboard`);
      return response.data;
    } catch (err: ErrorType) {
      console.error("Failed to fetch quiz history detail:", err);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { quizzes, isLoading, isFetchingMore, error, hasMore, loadMore, createQuiz, updateQuiz, patchQuiz, deleteQuiz, getQuizById, getHistory, getHistoryDetail };
}
