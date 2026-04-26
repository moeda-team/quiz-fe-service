"use client";

import { useState, useCallback } from "react";
import { API_BASE_URL, getAuthHeader } from "@/lib/api";

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    id: string;
    [key: string]: any;
  };
}

export type UploadCategory = "image" | "audio" | "video" | "document";
export type UploadContext = "theme" | "quiz" | "question" | "user";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      file: File,
      category: UploadCategory,
      context: UploadContext,
      contextId?: string
    ): Promise<UploadResponse> => {
      setIsUploading(true);
      setError(null);

      try {
        const authHeader = await getAuthHeader();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const response = await fetch(`${API_BASE_URL}/files/upload`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            // Note: Don't set Content-Type header for FormData, 
            // browser will set it with correct boundary
          },
          body: formData,
        });

        if (!response.ok) {
          let message = `Upload failed (${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData.message) message = errorData.message;
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const data = await response.json();
        return data as UploadResponse;
      } catch (err: any) {
        const message = err.message || "Failed to upload file";
        setError(message);
        throw new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    uploadFile,
    isUploading,
    error,
  };
}
