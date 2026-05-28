"use client";

import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface UseSocketConnectionProps {
  userId?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocketConnection({
  userId,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError
}: UseSocketConnectionProps = {}) {
  const { socket, isConnected, connect, disconnect, on, off } = useSocket();

  useEffect(() => {
    if (autoConnect && userId && !isConnected) {
      connect(userId).catch(onError);
    }
  }, [autoConnect, userId, isConnected, connect, onError]);

  useEffect(() => {
    // Set up event listeners
    if (socket) {
      if (onConnect) {
        socket.on('connect', onConnect);
      }
      if (onDisconnect) {
        socket.on('disconnect', onDisconnect);
      }
    }

    // Cleanup
    return () => {
      if (socket) {
        if (onConnect) {
          socket.off('connect', onConnect);
        }
        if (onDisconnect) {
          socket.off('disconnect', onDisconnect);
        }
      }
    };
  }, [socket, onConnect, onDisconnect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    on,
    off
  };
}

// Quiz-specific hook
export function useQuizSocket(quizId?: string) {
  const { socket, isConnected, joinRoom, leaveRoom, emit, on, off } = useSocket();

  useEffect(() => {
    if (quizId && isConnected) {
      joinRoom(`quiz-${quizId}`);
    }

    return () => {
      if (quizId) {
        leaveRoom(`quiz-${quizId}`);
      }
    };
  }, [quizId, isConnected, joinRoom, leaveRoom]);

  const startQuiz = (hostId: string) => {
    if (quizId) {
      emit('quiz-start', { quizId, hostId });
    }
  };

  const joinQuiz = (userId: string, userName: string) => {
    if (quizId) {
      emit('quiz-join', { quizId, userId, userName });
    }
  };

  const leaveQuiz = (userId: string) => {
    if (quizId) {
      emit('quiz-leave', { quizId, userId });
    }
  };

  const submitAnswer = (userId: string, questionId: string, answer: unknown) => {
    if (quizId) {
      emit('quiz-answer', { quizId, userId, questionId, answer });
    }
  };

  const nextQuestion = (questionId: string) => {
    if (quizId) {
      emit('quiz-next-question', { quizId, questionId });
    }
  };

  const endQuiz = () => {
    if (quizId) {
      emit('quiz-end', { quizId });
    }
  };

  return {
    socket,
    isConnected,
    startQuiz,
    joinQuiz,
    leaveQuiz,
    submitAnswer,
    nextQuestion,
    endQuiz,
    on,
    off
  };
}
