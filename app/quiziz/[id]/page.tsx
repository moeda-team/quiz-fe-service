"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import { useSocket } from "@/contexts/SocketContext";
import Loading from "@/components/button/Loading";
import { useParams, useRouter } from "next/navigation";
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

interface LeaderboardPayload {
  rank: number,
  id: string,
  name: string,
  score: number
}

export default function CodePage() {
  const params = useParams();
  const sessionId = params.id;
  const router = useRouter()
  const { socket } = useSocket();
  const [roomData, setRoomData] = useState<WaitingRoomData | null>(null);
  const [loading, setLoading] = useState(false);

  // Quiz state
  const [isStart, setIsStart] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, settotalQuestions] = useState(0);
  
  // Answer state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const selectedOptionRef = useRef<string | null>(null); // tambah ini
  const [textAnswer, setTextAnswer] = useState('');
  const [puzzleOrder, setPuzzleOrder] = useState<number[]>([]);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const [isleaderboard, setIsLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload[]>([]);
  
  const roomDataRef = useRef<WaitingRoomData | null>(null);
  const questionRef = useRef<Question | null>(null);
  const answerStartTimeRef = useRef<number>(0);

  // sync ref setiap kali state berubah
  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);
  
  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  useEffect(() => {
    answerStartTimeRef.current = answerStartTime;
  }, [answerStartTime]);

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
    const currentRoom = roomDataRef.current;
    const currentQuestion = questionRef.current;

    console.log("QUESTION:", currentQuestion?.type);
    console.log("selectedOption", selectedOption);

    if (!socket) return;

    if (!currentRoom) {
      console.warn("roomData masih null");
      return;
    }

    if (!currentQuestion) {
      console.warn("question masih null");
      return;
    }

    const timeTaken = Math.round(
      (Date.now() - answerStartTimeRef.current) / 1000
    );

    const participantId = getCookie("quiz_participantId") || "";

    const answerPayload: AnswerPayload = {
      sessionId: currentRoom.roomId,
      participantId,
      questionId: currentQuestion.id,
      timeTaken,
    };

    if (
      currentQuestion.type === "MULTIPLE_CHOICE" ||
      currentQuestion.type === "TRUE_FALSE"
    ) {
      if (selectedOptionRef.current) {
        answerPayload.optionId = selectedOptionRef.current;
      }
    } else if (currentQuestion.type === "ESSAY") {
      if (textAnswer.trim()) {
        answerPayload.textAnswer = textAnswer;
      }
    } else if (currentQuestion.type === "PUZZLE") {
      if (puzzleOrder.length > 0) {
        answerPayload.puzzleOrder = puzzleOrder;
      }
    }

    console.log("Submitting answer:", answerPayload);

    socket.emit("participant:answer", answerPayload);

    setSelectedOption(null);
    selectedOptionRef.current = null; // reset ref juga
    setTextAnswer("");
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
              roomId: data.sessionId || sessionId?.toString() || '',
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
            roomId: data.sessionId || prev.roomId,
            roomCode: data.joinCode || prev.roomCode,
            players: data.participants.map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.profileCharacter?.fullImage || undefined,
            })),
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
      console.log(selectedOption)
      submitAnswer();
      if (data) {
        setLoading(true);
        settotalQuestions(data.totalQuestions);
        setCurrentQuestion(prev => prev + 1);
        setQuestion(data.question);
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
      console.log('Quiz ended!', data.leaderboard);
      setLeaderboard(data.leaderboard)
      setIsLeaderboard(true)
      setLoading(false);
      // setTimeout(() => {
      //   router.push(`/quiziz`);
      // }, 1500);
    });

    return () => {
      socket.off("waiting_room:updated", handleWaitingRoomUpdated);
      socket.off('quiz:started');
      socket.off('quiz:next_question');
      socket.off('quiz:ended');
    };
  }, [socket]);

  return (
    <main className="min-h-screen w-full">
      <div 
        className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white px-3 sm:px-5 shadow-sm min-h-screen flex flex-col gap-2 sm:gap-4"
        style={{
          backgroundImage: 'url(/bg-mobile.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: 'Varela Round',
        }}
      >
        <div className="flex items-start justify-center rounded-2xl sm:rounded-4xl relative overflow-hidden">
          <Image 
            src="/logo-mobile.svg" 
            alt="Logo" 
            width={140} 
            height={140}
            className="w-32 sm:w-36 md:w-44"
          />
        </div>

        <GlobalMusicPlayer autoPlay volume={0.2} />

        {loading && (
          <Loading fullscreen />
        )}

        {!isleaderboard ? 
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
                  <div className="text-red-600 lg:w-22 lg:h-24 lg:ml-0 w-28 h-20 pr-3 text-lg font-bold text-center flex items-center justify-center">
                    <QuizTimer timeLimit={question?.timeLimit ?? 30} onTimeUp={submitAnswer} />
                  </div>
                </div>

                {/* question counter */}
                <div className="text-black text-base sm:text-lg font-bold pt-2 flex-shrink-0">
                  {currentQuestion}/{totalQuestions}
                </div>
                
                {/* question text */}
                <div className="text-black text-xs sm:text-base px-14 pt-8 w-full text-center font-bold flex-shrink-0">
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
                          onClick={() => {console.log("Selected Option:", option.id); setSelectedOption(option.id??"")}}
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
                          onClick={() => {console.log("Selected Option:", option.id); setSelectedOption(option.id??"")}}
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
                      <div className="relative w-20">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-full h-full object-contain drop-shadow-lg"
                        />

                        {/* Name */}
                        <span
                          className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 px-1 sm:px-2 py-0.5 text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-700"
                          style={{ fontFamily: "Varela Round, serif" }}
                        >
                          <div className="text-center w-16 sm:w-20 md:w-28 lg:w-44">
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
        : 
          <div className="relative">
            {/* back */}
            <div className="fixed w-full flex justify-start top-2 left-2 sm:top-5 sm:left-5">
              <button onClick={() => router.push(`/quiziz`)} className="">
                <Image
                  src="/back.svg"
                  alt="Back"
                  width={60}
                  height={60}
                  className="sm:h-14 md:w-20 md:h-20 object-cover"
                  priority
                />
              </button>
            </div>
            
            
            {/* leaderboard */}
            <div className="flex justify-center items-end">
              <div className="relative">
                <Image
                  src="/leader-2.svg"
                  alt="Leaderboard"
                  width={200}
                  height={200}
                  className="object-contain"
                  priority
                />
                <div className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <h1 className="text-[10px] font-bold text-gray-800">
                    {leaderboard.length > 1 ? leaderboard[1].name.length > 10 ? leaderboard[1].name.substring(0, 10) + '...' : leaderboard[1].name : 'N/A'}
                  </h1>
                </div>
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Image
                    src="/character/ava-1.svg"
                    alt="Leaderboard"
                    width={90}
                    height={90}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/leader-1.svg"
                  alt="Leaderboard"
                  width={250}
                  height={250}
                  className="object-contain"
                  priority
                />
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <h1 className="text-[10px] font-bold text-gray-800">
                    {leaderboard.length > 0 ? leaderboard[0].name.length > 10 ? leaderboard[0].name.substring(0, 10) + '...' : leaderboard[0].name : 'N/A'}
                  </h1>
                </div>
                <div className="absolute top-26 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Image
                    src="/character/ava-1.svg"
                    alt="Leaderboard"
                    width={120}
                    height={120}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/leader-3.svg"
                  alt="Leaderboard"
                  width={200}
                  height={200}
                  className="object-contain"
                  priority
                />
                <div className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <h1 className="text-[10px] font-bold text-gray-800">
                    {leaderboard.length > 2 ? leaderboard[2].name.length > 10 ? leaderboard[1].name.substring(0, 10) + '...' : leaderboard[1].name : 'N/A'}
                  </h1>
                </div>
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Image
                    src="/character/ava-1.svg"
                    alt="Leaderboard"
                    width={90}
                    height={90}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
    
            <div 
              className="max-w-3xl mx-auto mt-2 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 sm:border-4 border-amber-500"
              style={{
                backgroundImage: 'url(/images/bg-card-list.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: 'Varela Round',
              }}
            >
              <div className="max-h-[240px] sm:max-h-[300px] md:max-h-[380px] overflow-y-auto rounded-lg">
                <table className="border-separate w-full mb-1 px-0.5 text-xs sm:text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-white border-b-2 border-gray-300 bg-amber-800">
                      <th className="text-left py-1.5 sm:py-2 px-2 sm:px-4 rounded-tl-lg w-10 sm:w-12">
                        Rank
                      </th>
    
                      <th className="text-left py-1.5 sm:py-2 px-2 sm:px-4">
                        Name
                      </th>
    
                      <th className="text-right py-1.5 sm:py-2 px-2 sm:px-4 rounded-tr-lg">
                        Score
                      </th>
                    </tr>
                  </thead>
    
                  <tbody className="text-gray-700">
                    {leaderboard?.map((participant, i) => (
                      <tr
                        key={participant.id}
                        className={`
                          hover:bg-gray-100
                          ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          border-b border-gray-200
                        `}
                      >
                        <td className="py-1 sm:py-2 px-2 sm:px-4 font-bold">
                          {participant.rank}
                        </td>
    
                        <td className="py-1 sm:py-2 px-2 sm:px-4">
                          {participant.name}
                        </td>
    
                        <td className="py-1 sm:py-2 px-2 sm:px-4 text-right font-bold">
                          {participant.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </div>
    </main>
  );
}