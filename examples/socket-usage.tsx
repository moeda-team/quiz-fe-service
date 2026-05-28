"use client";

// Example of how to use Socket.IO in your components
import React, { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useQuizSocket } from '@/hooks/useSocketConnection';

// Example 1: Basic Socket.IO usage
export function BasicSocketExample() {
  const { socket, isConnected, emit, on } = useSocket();

  useEffect(() => {
    if (isConnected) {
      // Listen for custom events
      on('notification', (data) => {
        console.log('Received notification:', data);
      });

      // Listen for connection events
      on('connect', () => {
        console.log('Socket connected!');
      });

      on('disconnect', () => {
        console.log('Socket disconnected!');
      });
    }
  }, [isConnected, on]);

  const sendMessage = () => {
    emit('message', { text: 'Hello from client!' });
  };

  return (
    <div>
      <p>Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendMessage} disabled={!isConnected}>
        Send Message
      </button>
    </div>
  );
}

// Example 2: Quiz-specific Socket.IO usage
export function QuizSocketExample({ quizId }: { quizId: string }) {
  const {
    socket,
    isConnected,
    startQuiz,
    joinQuiz,
    leaveQuiz,
    submitAnswer,
    nextQuestion,
    endQuiz,
    on
  } = useQuizSocket(quizId);

  useEffect(() => {
    if (isConnected) {
      // Listen for quiz events
      on('quiz-started', (data) => {
        console.log('Quiz started:', data);
      });

      on('quiz-joined', (data) => {
        console.log('User joined quiz:', data);
      });

      on('quiz-answer-submitted', (data) => {
        console.log('Answer submitted:', data);
      });

      on('quiz-next-question', (data) => {
        console.log('Next question:', data);
      });

      on('quiz-ended', (data) => {
        console.log('Quiz ended:', data);
      });
    }
  }, [isConnected, on]);

  const handleStartQuiz = () => {
    startQuiz('host-user-id');
  };

  const handleJoinQuiz = () => {
    joinQuiz('user-123', 'John Doe');
  };

  const handleSubmitAnswer = () => {
    submitAnswer('user-123', 'question-456', { answer: 'Option A' });
  };

  const handleNextQuestion = () => {
    nextQuestion('question-456');
  };

  const handleEndQuiz = () => {
    endQuiz();
  };

  return (
    <div>
      <p>Quiz Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Quiz ID: {quizId}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={handleStartQuiz} disabled={!isConnected}>
          Start Quiz
        </button>
        <button onClick={handleJoinQuiz} disabled={!isConnected}>
          Join Quiz
        </button>
        <button onClick={handleSubmitAnswer} disabled={!isConnected}>
          Submit Answer
        </button>
        <button onClick={handleNextQuestion} disabled={!isConnected}>
          Next Question
        </button>
        <button onClick={handleEndQuiz} disabled={!isConnected}>
          End Quiz
        </button>
      </div>
    </div>
  );
}

// Example 3: Advanced usage with room management
export function RoomExample() {
  const { socket, isConnected, joinRoom, leaveRoom, emit, on } = useSocket();

  useEffect(() => {
    if (isConnected) {
      // Listen for room events
      on('room-joined', (data) => {
        console.log('Joined room:', data);
      });

      on('room-left', (data) => {
        console.log('Left room:', data);
      });

      on('room-message', (data) => {
        console.log('Room message:', data);
      });
    }
  }, [isConnected, on]);

  const handleJoinRoom = () => {
    joinRoom('room-123');
  };

  const handleLeaveRoom = () => {
    leaveRoom('room-123');
  };

  const handleSendToRoom = () => {
    emit('room-message', {
      roomId: 'room-123',
      event: 'custom-event',
      data: { message: 'Hello room!' }
    });
  };

  return (
    <div>
      <p>Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={handleJoinRoom} disabled={!isConnected}>
          Join Room
        </button>
        <button onClick={handleLeaveRoom} disabled={!isConnected}>
          Leave Room
        </button>
        <button onClick={handleSendToRoom} disabled={!isConnected}>
          Send to Room
        </button>
      </div>
    </div>
  );
}

// Example 4: Direct socket service usage (for non-React contexts)
export function DirectSocketExample() {
  const handleDirectConnection = async () => {
    try {
      const socketService = (await import('@/lib/socket')).default;
      
      // Connect directly
      await socketService.connect('user-123');
      
      // Listen to events
      socketService.on('custom-event', (data) => {
        console.log('Custom event:', data);
      });
      
      // Emit events
      socketService.emit('custom-event', { message: 'Hello!' });
      
      // Join room
      socketService.joinRoom('room-456');
      
      // Quiz operations
      socketService.startQuiz('quiz-789', 'host-user');
      socketService.joinQuiz('quiz-789', 'user-123', 'John Doe');
      
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleDirectConnection}>
        Connect Directly
      </button>
    </div>
  );
}
