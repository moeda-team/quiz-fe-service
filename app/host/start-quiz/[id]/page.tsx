"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import Image from 'next/image';
import { QuizDetailFromStorage } from '@/types/quiz';
import GlobalMusicPlayer from '@/components/GlobalMusicPlayer';

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface SessionCreatedResponse {
  sessionId: string;
  joinCode: string;
}

interface WaitingRoomData {
  roomId: string;
  roomCode: string;
  players: Player[];
  quizId: string;
  hostId: string;
  status: 'waiting' | 'starting' | 'started';
}

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { socket } = useSocket();
  const { setQuizMusic } = useMusicPlayer();
  const quizId = params.id as string;
  const hostId = session?.user?.id;

  const [roomData, setRoomData] = useState<WaitingRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [particleStyles, setParticleStyles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  const [playerStyles, setPlayerStyles] = useState<Array<{
    id: string;
    name: string;
    avatar?: string;
    left: number;
    top: number;
    duration: number;
    delay: number;
    scale: number;
    zIndex: number;
  }>>([]);

  // Generate particle styles once on mount
  useEffect(() => {
    const styles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
    setTimeout(() => setParticleStyles(styles), 0);
  }, []);

  // Generate grid-based positions with random offset to avoid overlap
  useEffect(() => {
    if (!roomData?.players) {
      const t = setTimeout(() => setPlayerStyles([]), 0);
      return () => clearTimeout(t);
    }

    const cols = Math.min(5, Math.ceil(Math.sqrt(roomData.players.length * 1.5)));
    const rows = Math.ceil(roomData.players.length / cols);
    const cellW = 90 / cols;
    const cellH = 80 / rows;

    const shuffled = [...Array(roomData.players.length).keys()].sort(() => Math.random() - 0.5);

    const styles = roomData.players.map((player, i) => {
      const slot = shuffled[i];
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      return {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        left: col * cellW + 5 + Math.random() * (cellW - 12),
        top: row * cellH + 5 + Math.random() * (cellH - 18),
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
        scale: 0.85 + Math.random() * 0.3,
        zIndex: roomData.players.length - i,
      };
    });

    const t = setTimeout(() => setPlayerStyles(styles), 0);
    return () => clearTimeout(t);
  }, [roomData?.players]);

  // Load quiz detail from localStorage and set background music
  useEffect(() => {
    const storageKey = `quiz_detail_${quizId}`;
    const storedQuiz = localStorage.getItem(storageKey);
    
    if (storedQuiz) {
      try {
        const quizDetail: QuizDetailFromStorage = JSON.parse(storedQuiz);
        if (quizDetail.backgroundMusic?.fileUrl) {
          setQuizMusic(quizDetail.backgroundMusic.fileUrl);
        } else {
          setQuizMusic('/media/default.mp3');
        }
      } catch (error) {
        console.error('Error parsing quiz detail from localStorage:', error);
        setQuizMusic('/media/default.mp3');
      }
    } else {
      setQuizMusic('/media/default.mp3');
    }
  }, [quizId, setQuizMusic]);

  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  
  // WebSocket and session management
  useEffect(() => {
    if (!session || !socket) {
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    // Check if session already exists in cookies
    const existingSessionId = getCookie(`quiz_session_${quizId}_${hostId}`);
    const existingJoinCode = getCookie(`quiz_joincode_${quizId}_${hostId}`);
    
    if (existingSessionId && existingJoinCode) {
      // Set room data from cookies (deferred to avoid cascading renders)
      setTimeout(() => {
        setRoomData({
          roomId: existingSessionId,
          roomCode: existingJoinCode,
          quizId,
          hostId: hostId || "",
          status: 'waiting',
          players: []
        });
        setIsLoading(false);
      }, 0);
      
      // Get waiting room data with existing session
      socket.emit('host:get_waiting_room', { 
        sessionId: existingSessionId
      });
    } else {
      // Create new session
      socket.emit('host:create_session', {
        quizId,
        hostId,
        timestamp: new Date().toISOString()
      });
    }

    // Listen for session created response
    const handleSessionCreated = (response: SessionCreatedResponse) => {
      // Save to cookies
      setCookie(`quiz_session_${quizId}_${hostId}`, response.sessionId, 1);
      setCookie(`quiz_joincode_${quizId}_${hostId}`, response.joinCode, 1);
      
      // Update room data (deferred to avoid cascading renders)
      setTimeout(() => {
        setRoomData({
          roomId: response.sessionId,
          roomCode: response.joinCode,
          quizId,
          hostId: hostId || "",
          status: 'waiting',
          players: []
        });
        setIsLoading(false);
      }, 0);
      
      // Get waiting room data after session created
      socket.emit('host:get_waiting_room', { 
        sessionId: response.sessionId
      });
    };
    
    // Listen for host:get_waiting_room response
    const handleHostGetWaitingRoom = (data: { joinCode: string; participants: Array<{ id: string; name: string; joinedAt: string }> }) => {
      console.log('📡 HOST:GET_WAITING_ROOM RESPONSE:', data);
      setRoomData(prev => {
        const updated = prev ? {
          ...prev,
          roomCode: data.joinCode,
          players: data.participants.map((p) => ({
            id: p.id,
            name: p.name,
            avatar: undefined
          }))
        } : null;
        console.log('📡 ROOM DATA UPDATED:', updated);
        return updated;
      });
    };

    // Handle waiting room updated event
    const handleWaitingRoomUpdated = (data: {
      sessionId?: string;
      joinCode?: string;
      participants: Array<{ id: string; name: string; avatar?: string }>;
    }) => {
      console.log('📡 WAITING_ROOM:UPDATED EVENT RECEIVED!', data);

      // For existing session, check against cookie session ID if roomData is not available yet
      const currentSessionId = roomData?.roomId || getCookie(`quiz_session_${quizId}_${hostId}`);

      // Check if this event is for our room
      if (data.sessionId && currentSessionId && data.sessionId !== currentSessionId) {
        console.warn('⚠️ Event for different room:', data.sessionId, 'Current:', currentSessionId);
        return;
      }

      // Update room data with new participants
      if (data.participants) {
        setRoomData(prev => {
          if (!prev) {
            // If no roomData exists, create it with the received data
            const newRoomData: WaitingRoomData = {
              roomId: data.sessionId || currentSessionId || '',
              roomCode: data.joinCode || getCookie(`quiz_joincode_${quizId}_${hostId}`) || '',
              quizId,
              hostId: hostId || "",
              status: 'waiting',
              players: data.participants.map((p) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar || undefined
              }))
            };
            console.log('📡 ROOM DATA CREATED WITH PARTICIPANTS:', newRoomData);
            return newRoomData;
          }

          const updated = {
            ...prev,
            roomCode: data.joinCode || prev.roomCode,
            players: data.participants.map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar || undefined
            }))
          };
          console.log('📡 ROOM DATA UPDATED WITH PARTICIPANTS:', updated);
          console.log('📡 Total participants now:', updated.players.length);
          return updated;
        });
      }
    };

    // Set up event listeners
    socket.on('session:created', handleSessionCreated);
    socket.on('waiting_room:updated', handleWaitingRoomUpdated);
    socket.on('host:get_waiting_room', handleHostGetWaitingRoom);

    // Add error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    // Cleanup
    return () => {
      socket.off('session:created', handleSessionCreated);
      socket.off('waiting_room:updated', handleWaitingRoomUpdated);
      socket.off('host:get_waiting_room', handleHostGetWaitingRoom);
      socket.off('error');
      socket.off('connect_error');
    };
  }, [session, socket, quizId, hostId, roomData?.roomId]);

  const handleStartQuiz = async () => {
    if (!roomData) return;
    
    setIsStarting(true);
    
    // Simulate starting quiz
    setTimeout(() => {
      router.push(`/host/quiz/${quizId}/live`);
    }, 2000);
  };

  // Debug function to manually test socket events
  const handleTestSocketEvents = () => {
    console.log('🔍 Socket status:', {
      connected: socket?.connected,
      id: socket?.id,
      disconnected: !socket?.connected
    });
    console.log('🔍 Current roomData:', roomData);
    
    // Test manual emit to trigger waiting room update
    if (socket?.connected) {
      console.log('📤 Manually emitting host:get_waiting_room...');
      socket.emit('host:get_waiting_room', { sessionId: roomData?.roomId });
    } else {
      console.error('❌ Socket not connected');
    }
  };

  // Test function to simulate player join
  const handleTestPlayerJoin = () => {
    if (socket?.connected) {
      socket.emit('participant:join', { 
        joinCode: roomData?.roomCode,
        name: "Test Player " + Date.now()
      });
    } else {
      console.error('❌ Socket not connected');
    }
  };

  // Manual refresh function to get latest waiting room data
  const handleRefreshWaitingRoom = () => {
    console.log('🔄 Manually refreshing waiting room data...');
    if (socket?.connected && roomData?.roomId) {
      socket.emit('host:get_waiting_room', { sessionId: roomData.roomId });
    } else {
      console.error('❌ Cannot refresh - socket not connected or no room data');
    }
  };

  const handleBack = () => {
    router.back();
  };


  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-amber-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-200 mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ fontFamily: 'Varela Round, serif' }}>Memuat waiting room...</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-amber-50">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'Varela Round, serif' }}
          >
            Waiting Room Tidak Ditemukan
          </h2>
          <Button onClick={handleBack} className="bg-amber-50 text-amber-900 hover:bg-amber-100 border-4 border-amber-700/50" style={{ fontFamily: 'Varela Round, serif' }}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-400 via-pink-500 to-purple-600 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-main.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Header */}
      <GlobalMusicPlayer />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center min-h-[calc(100vh-120px)] px-4 pt-6">
        {/* Title */}
        <h1 
          className="text-2xl md:text-3xl text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)] tracking-wider uppercase text-center mb-4"
          style={{ fontFamily: 'Varela Round, serif' }}
        >
          Menunggu Pemain
        </h1>

        {/* Room Code Badge with Leaves */}
        <div
          className="relative hover:scale-105 transition-transform hover:bg-transparent w-full h-10 sm:h-11 md:h-12 lg:h-18 xl:h-20 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base"
          onClick={() => navigator.clipboard.writeText(roomData.roomCode)}
        >
          <Image
            src="/bg-code.svg"
            alt="Login div"
            fill
            className="object-contain"
          />
          <span className="relative z-10 text-amber-900 mb-2" style={{ fontFamily: 'Varela Round, serif' }}>Kode : {roomData.roomCode}</span>
        </div>

        {/* Wooden Start Button */}
        <Button 
          onClick={handleStartQuiz}
          disabled={isStarting || roomData.players.length === 0}
          className="relative hover:scale-105 transition-transform hover:bg-transparent w-full h-10 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {isStarting ? (
            <div className="flex items-center" style={{ fontFamily: 'Varela Round, serif' }}>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Memulai...
            </div>
          ) : (
            <>
              <Image
                src="/bg-start.svg"
                alt="Login div"
                fill
                className="object-contain"
              />
              <span className="relative z-10 text-white" style={{ fontFamily: 'Varela Round, serif' }}>Mulai Kuis</span>
            </>
          )}
        </Button>

        {/* Players Area */}
        <div className="relative w-full flex-1 min-h-[360px] md:min-h-[420px]">
          {playerStyles.map((player) => (
            <div
              key={player.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `${player.left}%`,
                top: `${player.top}%`,
                animation: `float ${player.duration}s ease-in-out ${player.delay}s infinite alternate`,
                zIndex: player.zIndex,
              }}
            >
                {/* Cloud Platform */}
                <div className="relative mb-1">
                  {/* Avatar Character */}
                  <div className="relative w-38 h-38 flex items-center justify-center z-10">
                    <Image src="/character/char-1.svg" alt={player.name} width={80} height={80} className="w-full h-full object-contain drop-shadow-lg" />
                    <span className="absolute text-xs font-bold bottom-8 left-1/2 transform -translate-x-1/2 z-10 text-amber-700" style={{ fontFamily: 'Varela Round, serif' }}>
                      {player.name.length > 10 ? player.name.substring(0,10) + '...' : player.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <style>{`
          @keyframes float {
            0% { transform: translate(0, 0); }
            25% { transform: translate(10px, -14px); }
            50% { transform: translate(-6px, 6px); }
            75% { transform: translate(14px, 10px); }
            100% { transform: translate(-10px, -4px); }
          }
        `}</style>

        {/* Debug Buttons */}
        <div className="hidden flex gap-2 mt-4">
          <Button 
            onClick={handleTestSocketEvents}
            className="bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/50 px-4 py-2 text-sm"
          >
            🧪 Test Events
          </Button>
          <Button 
            onClick={handleTestPlayerJoin}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-500/50 px-4 py-2 text-sm"
          >
            👥 Test Join
          </Button>
          <Button 
            onClick={handleRefreshWaitingRoom}
            className="bg-green-500/20 hover:bg-green-500/30 text-white border border-green-500/50 px-4 py-2 text-sm"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-pulse"
            style={style}
          />
        ))}
      </div>
    </div>
  );
}