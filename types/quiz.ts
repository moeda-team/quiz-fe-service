import { BaseEntity, DynamicObject } from './common';

export interface Quiz extends BaseEntity {
  title: string;
  questions: number | QuizQuestion[];
  author?: string;
  coverImage?: string;
  description?: string;
  isPublished?: boolean;
  totalQuestions?: number;
}

export interface QuizQuestion extends BaseEntity {
  text: string;
  type: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE";
  order: number;
  timeLimit?: number;
  imageUrl?: string;
  musicFile?: string;
  correctAnswer?: string;
  answers?: AnswerOption[];
  points?: number;
}

export interface AnswerOption {
  text: string;
  isCorrect: boolean;
  points: number;
}

export interface QuizCreateData {
  title: string;
  description?: string;
  coverImage?: string;
  questions?: QuizQuestion[];
  isPublished?: boolean;
}

export type QuizUpdateData = Partial<QuizCreateData>;

export interface QuizApiResponse {
  id: string | number;
  title: string;
  name?: string;
  questions?: QuizQuestion[] | number;
  total_questions?: number;
  author?: string;
  creator?: {
    name: string;
  };
  coverImage?: string;
  image?: string;
}

// For dynamic API responses that may have varying structures
export type QuizDynamicResponse = DynamicObject & QuizApiResponse;
