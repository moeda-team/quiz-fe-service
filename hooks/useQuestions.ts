"use client";

import { useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export interface Question {
  id: string;
  text: string;
  type: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE";
  order: number;
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

interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuizQuestions = useCallback(async (quizId: string | number): Promise<Question[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<Question[]>(`/quizzes/${quizId}/questions`);
      return (response as ApiResponse<Question[]>).data || response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data soal";
      console.error("Failed to fetch quiz questions:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createQuestion = useCallback(async (quizId: string | number, data: Partial<Question>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPost(`/quizzes/${quizId}/questions`, data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat soal";
      console.error("Failed to create question:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuestion = useCallback(async (quizId: string | number, questionId: string | number, data: Partial<Question>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiPut(`/quizzes/${quizId}/questions/${questionId}`, data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memperbarui soal";
      console.error("Failed to update question:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (quizId: string | number, questionId: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiDelete(`/quizzes/${quizId}/questions/${questionId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghapus soal";
      console.error("Failed to delete question:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getQuestionById = useCallback(async (quizId: string | number, questionId: string | number): Promise<Question> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet<Question>(`/quizzes/${quizId}/questions/${questionId}`);
      return (response as ApiResponse<Question>).data || response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil detail soal";
      console.error("Failed to fetch question details:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    questions,
    isLoading,
    error,
    getQuizQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById
  };
}
