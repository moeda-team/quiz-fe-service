"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import socketService from '@/lib/socket';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId?: string) => Promise<void>;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  // Socket ID locking methods
  lockSocketId: (socketId: string) => void;
  getLockedSocketId: () => string | null;
  clearLockedSocketId: () => void;
  // Quiz specific methods
  startQuiz: (quizId: string, hostId: string) => void;
  joinQuiz: (quizId: string, userId: string, userName: string) => void;
  leaveQuiz: (quizId: string, userId: string) => void;
  submitAnswer: (quizId: string, userId: string, questionId: string, answer: unknown) => void;
  nextQuestion: (quizId: string, questionId: string) => void;
  endQuiz: (quizId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SocketProvider({ children, userId }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (userId?: string) => {
    try {
      const socketInstance = await socketService.connect(userId);
      
      // Set up connection status listeners first
      socketInstance.on('connect', () => setIsConnected(true));
      socketInstance.on('disconnect', () => setIsConnected(false));
      
      // Update state asynchronously to avoid cascading renders
      setTimeout(() => {
        setSocket(socketInstance);
        setIsConnected(socketInstance.connected);
      }, 0);
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setTimeout(() => setIsConnected(false), 0);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setTimeout(() => {
      setSocket(null);
      setIsConnected(false);
    }, 0);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketService.leaveRoom(roomId);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    socketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    socketService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    socketService.off(event, callback);
  }, []);

  // Socket ID locking methods
  const lockSocketId = useCallback((socketId: string) => {
    socketService.lockSocketId(socketId);
  }, []);

  const getLockedSocketId = useCallback(() => {
    return socketService.getLockedSocketId();
  }, []);

  const clearLockedSocketId = useCallback(() => {
    socketService.clearLockedSocketId();
  }, []);

  // Quiz specific methods
  const startQuiz = useCallback((quizId: string, hostId: string) => {
    socketService.startQuiz(quizId, hostId);
  }, []);

  const joinQuiz = useCallback((quizId: string, userId: string, userName: string) => {
    socketService.joinQuiz(quizId, userId, userName);
  }, []);

  const leaveQuiz = useCallback((quizId: string, userId: string) => {
    socketService.leaveQuiz(quizId, userId);
  }, []);

  const submitAnswer = useCallback((quizId: string, userId: string, questionId: string, answer: unknown) => {
    socketService.submitAnswer(quizId, userId, questionId, answer);
  }, []);

  const nextQuestion = useCallback((quizId: string, questionId: string) => {
    socketService.nextQuestion(quizId, questionId);
  }, []);

  const endQuiz = useCallback((quizId: string) => {
    socketService.endQuiz(quizId);
  }, []);

  useEffect(() => {
    console.log('SocketProvider useEffect - userId:', userId);
    console.log('SocketProvider useEffect - socket:', socket);
    console.log('SocketProvider useEffect - isConnected:', isConnected);
    
    // Auto-connect when provider mounts
    if (userId) {
      console.log('User ID available, connecting with:', userId);
      connect(userId);
    } else {
      console.log('No userId provided, using fallback for testing');
      connect("test-user-123"); // Fallback for testing when no session
    }

    // Cleanup on unmount
    return () => {
      console.log('SocketProvider cleanup - disconnecting');
      disconnect();
    };
  }, [userId, connect, disconnect]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    emit,
    on,
    off,
    lockSocketId,
    getLockedSocketId,
    clearLockedSocketId,
    startQuiz,
    joinQuiz,
    leaveQuiz,
    submitAnswer,
    nextQuestion,
    endQuiz,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
