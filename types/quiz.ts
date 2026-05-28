import { BaseEntity, DynamicObject } from './common';

export interface Quiz extends BaseEntity {
  title: string;
  questions: number | QuizQuestion[];
  author?: string;
  coverImage?: string;
  description?: string;
  instructions?: string;
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

// Response interface for quiz operations
export interface QuizResponse {
  data: Quiz;
  statusCode: string;
}

// For dynamic API responses that may have varying structures
export type QuizDynamicResponse = DynamicObject & QuizApiResponse;

// Question Payload Types
export interface QuestionOption {
  text: string;
  points: number;
  isCorrect: boolean;
  order: number;
  imageUrl?: string;
}

export interface EssayAnswer {
  expectedAnswer: string;
}

export interface PuzzleItem {
  text: string;
  correctOrder: number;
  points?: number;
}

export interface BaseQuestionPayload {
  quizId: string;
  order: number;
  text: string;
  type: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE";
  timeLimit: number;
  voiceUrl: string;
  imageUrl: string;
  musicFile: string;
}

export interface TrueFalsePayload extends BaseQuestionPayload {
  type: "TRUE_FALSE";
  options: QuestionOption[];
}

export interface MultipleChoicePayload extends BaseQuestionPayload {
  type: "MULTIPLE_CHOICE";
  options: QuestionOption[];
}

export interface EssayPayload extends BaseQuestionPayload {
  type: "ESSAY";
  essayAnswer: EssayAnswer;
  options: QuestionOption[];
}

export interface PuzzlePayload extends BaseQuestionPayload {
  type: "PUZZLE";
  puzzleItems: PuzzleItem[];
}

export type QuestionPayload = TrueFalsePayload | MultipleChoicePayload | EssayPayload | PuzzlePayload;

// Music-related types
export interface MusicData {
  id?: string;
  title: string;
  artist?: string;
  fileUrl: string;
  duration?: number;
  isPlaying?: boolean;
}

export interface QuizWithMusic extends Quiz {
  backgroundMusic?: MusicData;
  questions: (QuizQuestion & {
    musicFile?: string;
  })[];
}

// LocalStorage detail type
export interface QuizDetailFromStorage {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  backgroundMusic?: MusicData;
  questions: QuizQuestion[];
  totalQuestions?: number;
  author?: string;
}


export interface QuizHistory {
  id: string;
  startedAt: string;
  participantCount: number;
  joinCode: string;
  status: string;
}

export interface QuizHistoryDetail {
  leaderboard: {
    rank: number;
    participantId: string;
    name: string;
    score: number;
    savedAt: string;
  }[];
  session: {
    id: string;
    quizId: string;
    quizTitle: string;
    startedAt: string;
    endedAt: string;
  };
}