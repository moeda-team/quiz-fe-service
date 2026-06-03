import { io, Socket } from 'socket.io-client';

// Socket.IO configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'wss://api-quiz.hompimpa.biz.id';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private lockedSocketId: string | null = null;

  // Lock socket ID to a specific value
  lockSocketId(socketId: string): void {
    this.lockedSocketId = socketId;
    console.log('🔒 Socket ID locked to:', socketId);
  }

  // Get locked socket ID
  getLockedSocketId(): string | null {
    return this.lockedSocketId;
  }

  // Clear locked socket ID
  clearLockedSocketId(): void {
    this.lockedSocketId = null;
    console.log('🔓 Socket ID unlocked');
  }

  // Connect to socket server
  connect(userId?: string): Promise<Socket> {
    console.log('SocketService.connect - userId:', userId);
    console.log('SocketService.connect - SOCKET_URL:', SOCKET_URL);
    
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('Socket already connected');
        resolve(this.socket);
        return;
      }

      console.log('Creating new socket connection...');
      this.socket = io(SOCKET_URL, {
        auth: {
          userId: userId || 'anonymous'
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully! ID:', this.socket?.id);
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected. Reason:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, need to reconnect manually
          console.log('🔄 Server disconnected, attempting manual reconnect...');
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('Error details:', error.message);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          reject(error);
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
      });
    });
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get current socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit events
  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Listen to events
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('Socket not initialized, cannot listen to event:', event);
    }
  }

  // Stop listening to events
  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Join room
  joinRoom(roomId: string): void {
    this.emit('join-room', { roomId });
  }

  // Leave room
  leaveRoom(roomId: string): void {
    this.emit('leave-room', { roomId });
  }

  // Send message to room
  sendToRoom(roomId: string, event: string, data?: unknown): void {
    this.emit('room-message', { roomId, event, data });
  }

  // Quiz specific events
  startQuiz(quizId: string, hostId: string): void {
    this.emit('quiz-start', { quizId, hostId });
  }

  joinQuiz(quizId: string, userId: string, userName: string): void {
    this.emit('quiz-join', { quizId, userId, userName });
  }

  leaveQuiz(quizId: string, userId: string): void {
    this.emit('quiz-leave', { quizId, userId });
  }

  submitAnswer(quizId: string, userId: string, questionId: string, answer: unknown): void {
    this.emit('quiz-answer', { quizId, userId, questionId, answer });
  }

  nextQuestion(quizId: string, questionId: string): void {
    this.emit('quiz-next-question', { quizId, questionId });
  }

  endQuiz(quizId: string): void {
    this.emit('quiz-end', { quizId });
  }

  // Get connection status
  getStatus(): {
    connected: boolean;
    connecting: boolean;
    disconnected: boolean;
    id?: string;
  } {
    return {
      connected: this.socket?.connected || false,
      connecting: this.socket?.active || false,
      disconnected: !this.socket?.connected,
      id: this.socket?.id
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
export { SocketService };
