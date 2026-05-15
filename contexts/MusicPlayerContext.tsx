"use client";

import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface MusicPlayerContextType {
  currentMusicUrl: string;
  isPlaying: boolean;
  currentSource: 'quiz' | 'question' | null;
  currentSourceName: string;
  playMusic: (url: string, source: 'quiz' | 'question', sourceName: string) => void;
  pauseMusic: () => void;
  togglePlayPause: () => void;
  setQuizMusic: (url: string) => void;
  setQuestionMusic: (questionId: string, questionText: string, musicUrl: string) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentMusicUrl, setCurrentMusicUrl] = useState<string>("/media/default.mp3");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSource, setCurrentSource] = useState<'quiz' | 'question' | null>(null);
  const [currentSourceName, setCurrentSourceName] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playMusic = (url: string, source: 'quiz' | 'question', sourceName: string) => {
    setCurrentMusicUrl(url);
    setCurrentSource(source);
    setCurrentSourceName(sourceName);
    setIsPlaying(true);
  };

  const pauseMusic = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const setQuizMusic = (url: string) => {
    setCurrentMusicUrl(url);
    setCurrentSource('quiz');
    setCurrentSourceName('Quiz Music');
  };

  const setQuestionMusic = (questionId: string, questionText: string, musicUrl: string) => {
    setCurrentMusicUrl(musicUrl);
    setCurrentSource('question');
    setCurrentSourceName(`Soal: ${questionText.substring(0, 30)}...`);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentMusicUrl,
        isPlaying,
        currentSource,
        currentSourceName,
        playMusic,
        pauseMusic,
        togglePlayPause,
        setQuizMusic,
        setQuestionMusic,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
