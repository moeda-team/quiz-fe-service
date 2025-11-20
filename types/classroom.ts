export interface Material {
  id: string;
  title: string;
  type: 'video' | 'ppt' | 'pdf';
  url: string;
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  materials: Material[];
  quizzes: Quiz[];
  createdAt: string;
  mentor?: string;
  duration?: string;
  progress?: number;
}

export interface Meeting {
  id: string;
  title: string;
  status: 'online' | 'offline';
  statusLabel?: string;
  hasDocument?: boolean;
  hasPresentation?: boolean;
  hasVideo?: boolean;
}

export interface ClassSession {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  materials: SessionMaterial[];
  description: string;
}

export interface SessionMaterial {
  id: string;
  title: string;
  type: 'document' | 'audio' | 'video' | 'presentation';
  content?: string;
  audioUrl?: string;
  duration?: string;
  downloadUrl?: string;
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  credits: number;
  schedule: string;
  banner: string;
  meetings: Meeting[];
  sessions: ClassSession[];
  studentCount?: number;
  createdAt: string;
}
