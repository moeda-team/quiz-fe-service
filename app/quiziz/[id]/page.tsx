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

interface AnswerPayload {
  sessionId: string;
  participantId: string;
  questionId: string;
  timeTaken: number;
  optionId?: string;
  textAnswer?: string;
  puzzleOrder?: number[];
}


export default function CodePage() {
  const { socket } = useSocket();
  const router = useRouter();
  const [roomData, setRoomData] = useState<WaitingRoomData | null>(null);
  const [loading, setLoading] = useState(false);

  // Quiz state
  const [isStart, setIsStart] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, settotalQuestions] = useState(0);
  
  // Answer state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [puzzleOrder, setPuzzleOrder] = useState<number[]>([]);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

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

  const submitAnswer = () => {
    if (!socket || !question || !roomData) return;

    const timeTaken = Math.round((Date.now() - answerStartTime) / 1000);
    const participantId = getCookie("participant_id") || "";
    
    const answerPayload: AnswerPayload = {
      sessionId: roomData.roomId,
      participantId,
      questionId: question.id,
      timeTaken,
    };
    console.log(question.type, selectedOption, textAnswer, puzzleOrder);
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      if (selectedOption) {
        answerPayload.optionId = selectedOption;
      }
    } else if (question.type === 'ESSAY') {
      if (textAnswer.trim()) {
        answerPayload.textAnswer = textAnswer;
      }
    } else if (question.type === 'PUZZLE') {
      if (puzzleOrder.length > 0) {
        answerPayload.puzzleOrder = puzzleOrder;
      }
    }

    console.log('Submitting answer:', answerPayload);
    socket.emit('participant:answer', answerPayload);

    // Reset answer state for next question
    setSelectedOption(null);
    setTextAnswer('');
    setPuzzleOrder([]);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
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
        console.log(data)
        setLoading(true);
        settotalQuestions(data.totalQuestions);
        setCurrentQuestion(1);
        setQuestion(data.firstQuestion);
        setSelectedOption(null);
        setTextAnswer('');
        setPuzzleOrder([]);
        setAnswerStartTime(Date.now());
        setTimeout(() => {
          setIsStart(true);
          setLoading(false);
        }, 1500);
      }
    });

    socket.on('quiz:next_question', (data) => {
      submitAnswer();
      if (data) {
        console.log(data)
        setLoading(true);
        settotalQuestions(data.totalQuestions);
        setCurrentQuestion(prev => prev + 1);
        setQuestion(data.question);
        setSelectedOption(null);
        setTextAnswer('');
        setPuzzleOrder([]);
        setAnswerStartTime(Date.now());
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
      socket.off('quiz:next_question');
      socket.off('quiz:ended');
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

        <div className="flex h-[calc(100vh-200px)] w-full flex-col items-center justify-start rounded-2xl py-2">
          {/* Players Area */}
          {isStart ? (
            <div 
              className="flex flex-col items-center gap-2 w-[90%] h-full rounded-2xl relative overflow-y-auto"
              style={{
                backgroundImage: 'url(/bg-answere.svg)',
                backgroundSize: 'contain',
                backgroundPosition: 'top',
                fontFamily: 'Varela Round',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* timer */}
              <div className="absolute w-full">
                <div className="text-red-600 w-22 h-20 pr-3 text-lg font-bold text-center flex items-center justify-center">
                  <QuizTimer timeLimit={question?.timeLimit ?? 30} onTimeUp={submitAnswer} />
                </div>
              </div>

              {/* question counter */}
              <div className="text-black text-base sm:text-lg font-bold pt-2 flex-shrink-0">
                {currentQuestion}/{totalQuestions}
              </div>
              
              {/* question text */}
              <div className="text-black text-xs sm:text-base px-8 pt-8 w-full text-center font-bold flex-shrink-0">
                {question?.text}
              </div>

              {/* image */}
              {question?.imageUrl && (
                <div className="flex-shrink-0 rounded-xl h-auto">
                  <img
                    src={question?.imageUrl || "/images/bg-main.webp"}
                    alt="Quiz"
                    className="object-cover object-center rounded-xl w-full h-44"
                  />
                </div>
              )}
                
              {/* options area - flexible center */}
              <div className="flex-1 flex flex-col items-center justify-start px-2 sm:px-4 w-[70%]">
                {question?.type === 'ESSAY' ? (
                  <div className="w-full flex flex-col gap-2">
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Tulis jawaban Anda di sini..."
                      className="w-full px-3 py-2 border border-amber-700 rounded-lg text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-700 text-sm sm:text-base min-h-24"
                    />
                  </div>
                ) : question?.type === 'TRUE_FALSE' ? (
                  <div className="gap-1 sm:gap-2 flex flex-col items-center justify-center w-full">
                    {question?.options?.map((option, index) => (
                      <div
                        key={index}
                        className={`${
                          selectedOption === option.id ? 'bg-green-600' : 'bg-[#5A3319]'
                        } text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-3 bg-[#5A3319] min-w-fit sm:min-w-44 max-w-xs w-full rounded-lg cursor-pointer hover:bg-[#6B4429] transition-colors active:scale-95 text-center`}
                        onClick={() => setSelectedOption(option.id??"")}
                      >
                        {String.fromCharCode(65 + index)}. {option.text}
                      </div>
                    ))}
                  </div>
                ) : question?.type === 'PUZZLE' ? (
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-amber-900 text-sm sm:text-base font-bold text-center">
                      Susun potongan puzzle dalam urutan yang benar
                    </p>
                    <div className="gap-1 sm:gap-2 flex flex-col items-center justify-center w-full">
                      {question?.options?.map((option, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer?.setData('index', index.toString());
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedIndex = parseInt(e.dataTransfer?.getData('index') || '0');
                            const newOrder = [...puzzleOrder];
                            [newOrder[draggedIndex], newOrder[index]] = [newOrder[index], newOrder[draggedIndex]];
                            setPuzzleOrder(newOrder);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          className="text-white text-xs sm:text-sm font-bold px-4 py-2 bg-[#5A3319] hover:bg-[#6B4429] min-w-fit sm:min-w-44 w-full rounded cursor-move hover:shadow-lg transition-all"
                        >
                          {String.fromCharCode(65 + index)}. {option.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="gap-1 sm:gap-2 flex flex-col items-center justify-center w-full">
                    {question?.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedOption(option.id??"")}
                        className={`text-white text-xs sm:text-sm font-bold px-4 py-1 w-full rounded-sm cursor-pointer transition-all ${
                          selectedOption === option.id 
                            ? 'bg-green-600 scale-105' 
                            : 'bg-[#5A3319] hover:bg-[#6B4429]'
                        } active:scale-95`}
                      >
                        {String.fromCharCode(65 + index)}. {option.text}
                      </button>
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
                    <div className="relative w-28">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-contain drop-shadow-lg"
                      />

                      {/* Name */}
                      <span
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold text-amber-700"
                        style={{ fontFamily: "Varela Round, serif" }}
                      >
                        <div className="text-center text-10 w-44">
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