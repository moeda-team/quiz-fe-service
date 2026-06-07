"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import { useSocket } from "@/contexts/SocketContext";
import Loading from "@/components/button/Loading";
import { useRouter } from "next/navigation";
import { Question } from "@/hooks/useQuestions";
import QuizTimer from "@/components/QuizTimer";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface WaitingRoomData {
  roomId: string;
  roomCode: string;
  players: Player[];
  status: 'waiting' | 'starting' | 'started';
}


export default function CodePage() {
  const { socket } = useSocket();
  const router = useRouter();
  const [roomData, setRoomData] = useState<WaitingRoomData | null>(null);
  const [loading, setLoading] = useState(false);

  // Quiz state
  const [isStart, setIsStart] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  

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

  const [particleStyles, setParticleStyles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);


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

  useEffect(() => {
    if (!socket) return;

    const joinCode = getCookie("quiz_joincode");

    if (!joinCode) return;

    // Emit get waiting room
    socket.emit("participant:get_waiting_room", {
      joinCode,
    });

    // Listen update waiting room
    const handleWaitingRoomUpdated = (data: {
      sessionId?: string;
      joinCode?: string;
      participants: Array<{ id: string; name: string; profileCharacter?: { fullImage?: string } }>;
    }) => {
      
      // Update room data with new participants
      if (data.participants) {
        setRoomData(prev => {
          if (!prev) {
            // If no roomData exists, create it with the received data
            const newRoomData: WaitingRoomData = {
              roomId: data.sessionId || '',
              roomCode: data.joinCode || '',
              status: 'waiting',
              players: data.participants.map((p) => ({
                id: p.id,
                name: p.name,
                avatar: p.profileCharacter?.fullImage || undefined
              }))
            };
            return newRoomData;
          }

          const updated = {
            ...prev,
            roomCode: data.joinCode || prev.roomCode,
            players: data.participants.map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.profileCharacter?.fullImage || undefined
            }))
          };
          return updated;
        });
      }
    };

    socket.on("waiting_room:updated", handleWaitingRoomUpdated);

    socket.on('quiz:started', (data) => {
      if (data.message === 'Quiz started!') {
        setLoading(true);
        console.log(data.firstQuestion);
        setQuestion(data.firstQuestion);
        setTimeout(() => {
          setIsStart(true);
          setLoading(false);
        }, 1500);
      }
    });

    socket.on('quiz:ended', (data) => {
      console.log('Quiz ended!', data);
      setLoading(true);
      setTimeout(() => {
        router.push(`/quiziz/${data.sessionId}/leaderboard`);
      }, 1500);
    });

    return () => {
      socket.off("waiting_room:updated", handleWaitingRoomUpdated);
      socket.off('quiz:started');
    };
  }, [socket]);

  return (
    <main className="mx-auto w-full">
      <div 
        className="mx-auto w-full bg-white px-3 sm:px-5 shadow-sm min-h-screen flex flex-col gap-2 sm:gap-4"
        style={{
          backgroundImage: 'url(/bg-mobile.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          fontFamily: 'Varela Round',
        }}
      >
        <div className="flex items-start justify-center rounded-4xl relative overflow-hidden">
          <Image 
            src="/logo-mobile.svg" 
            alt="Logo" 
            width={140} 
            height={140}
            className="w-44"
          />
        </div>

        <GlobalMusicPlayer />

        {loading && (
          <Loading fullscreen />
        )}

        <div className="flex h-[calc(100vh-200px)] w-full flex-col items-center justify-start rounded-2xl py-8">
          {/* Players Area */}
          {isStart ? (
            <div 
              className="flex flex-col items-center gap-2 sm:gap-4 w-[80%] h-full rounded-2xl relative overflow-y-auto"
              style={{
                backgroundImage: 'url(/bg-answere.svg)',
                backgroundSize: 'contain',
                backgroundPosition: 'top',
                fontFamily: 'Varela Round',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* timer */}
              <div className="text-red-600 absolute left-6 top-6.5 pr-3 text-lg font-bold pb-4 sm:pb-6 flex-shrink-0">
                <QuizTimer timeLimit={question?.timeLimit ?? 30} />
              </div>

              {/* question counter */}
              <div className="text-black text-base sm:text-lg font-bold pt-2 flex-shrink-0">
                {currentQuestion + 1}/4
              </div>
              
              {/* question text */}
              <div className="text-black text-xs sm:text-base px-3 sm:px-6 py-4 w-full text-center font-bold flex-shrink-0">
                {question?.text}
              </div>

              {/* image */}
              {question?.imageUrl && (
                <div className="flex-shrink-0 rounded-xl h-auto">
                  <img
                    src={question?.imageUrl || "/images/bg-main.webp"}
                    alt="Quiz"
                    className="object-cover object-center rounded-xl w-full sm:w-40 h-24 sm:h-40"
                  />
                </div>
              )}
                
              {/* options area - flexible center */}
              <div className="flex-1 flex flex-col items-center justify-start px-2 sm:px-4 w-[70%]">
                {question?.type === 'ESSAY' ? (
                  <p className="text-amber-900 text-base sm:text-2xl font-bold text-center">Sedang dijawab peserta ...</p>
                ) : (
                  <div className="gap-1 sm:gap-2 flex flex-col items-center justify-center w-full">
                    {question?.options?.map((option, index) => (
                      <div
                        key={index}
                        className="text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-3 bg-[#5A3319] min-w-fit sm:min-w-44 max-w-xs w-full rounded-lg cursor-pointer hover:bg-[#6B4429] transition-colors active:scale-95 text-center"
                      >
                        {String.fromCharCode(65 + index)}. {option.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          ) : 
            <div className="relative w-full flex-1 min-h-64 sm:min-h-80 md:min-h-[420px]">
              {playerStyles.map((player) => (
                <div
                  key={player.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${player.left}%`,
                    top: `${player.top}%`,
                    animation: `float ${player.duration}s ease-in-out ${player.delay}s infinite alternate`,
                    zIndex: player.zIndex,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex items-center justify-center">
                    <div className="relative w-16 sm:w-24 md:w-32">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-contain drop-shadow-lg"
                      />

                      {/* Name */}
                      <span
                        className="absolute bottom-1 sm:bottom-3 left-1/2 -translate-x-1/2 px-1 sm:px-2 py-0.5 text-6px sm:text-9px md:text-10px font-bold text-amber-700 w-20 sm:w-44"
                        style={{ fontFamily: "Varela Round, serif" }}
                      >
                        <div className="text-center text-xs sm:text-sm break-words">
                          {player.name.length > 12
                            ? player.name.substring(0, 12) + "..."
                            : player.name}
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
  
          <style>{`
            @keyframes float {
              0% { transform: translate(0, 0); }
              25% { transform: translate(10px, -14px); }
              50% { transform: translate(-6px, 6px); }
              75% { transform: translate(14px, 10px); }
              100% { transform: translate(-10px, -4px); }
            }
          `}</style>
          
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
      </div>
    </main>
  );
}