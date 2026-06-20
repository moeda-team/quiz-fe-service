"use client"

import { useEffect, useState, useRef } from "react";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import QuizTimer from "@/components/QuizTimer";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";
import { toast } from "sonner";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Question } from "@/hooks/useQuestions";
import { useSocket } from "@/contexts/SocketContext";
import { useSession } from "next-auth/react";

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { getQuizById } = useQuizzes();
  const { emit, on, off, isConnected, lockSocketId } = useSocket();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[] | []>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id) return;
      try {
        const response = await getQuizById(params.id as string);
        if (!response) return;

        const quizData: Quiz = ('data' in response && response.data) ? response.data : response as Quiz;
        setQuestions(quizData.questions as Question[]);
      } catch {
        toast.error("Gagal mengambil data kuis");
      }
    };

    fetchQuiz();
  }, [params.id, getQuizById]);

  useEffect(() => {
    if (!params.id) return;

    const quizId = params.id as string;
    const hostId = session?.user?.id;

    const existingSessionId = getCookie(`quiz_session_${quizId}_${hostId}`);
    console.log('Existing session ID:', existingSessionId);

    lockSocketId(existingSessionId || '');

    console.log('Socket connected:', isConnected);

    if (isConnected) {
      console.log('Emitting host:start_quiz with sessionId:', existingSessionId);
      emit('host:start_quiz', { sessionId: existingSessionId });
    } else {
      console.log('Socket not connected, waiting...');
    }

    on('quiz:started', (data) => {
      console.log('Quiz started:', data);
      toast.success('Kuis dimulai!');
    });

    return () => {
      off('quiz:started');
    };
  }, [params.id, isConnected, emit, on, off, lockSocketId, session]);

  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
    }
  }, [currentQuestion]);


  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const quizId = params.id as string;
      const hostId = session?.user?.id;
      const sessionId = getCookie(`quiz_session_${quizId}_${hostId}`);
      const questionId = questions[currentQuestion + 1]?.id || '';

      emit('host:next_question', {
        sessionId: sessionId || '',
        questionId
      });
      console.log('Emitting host:next_question with sessionId:', sessionId, 'and questionId:', questionId);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const nextSessionId = getCookie(`quiz_session_${params.id}_${session?.user?.id}`);
      console.log('Ending quiz with session ID:', nextSessionId);
      emit('host:end_quiz', {
        sessionId: nextSessionId || '',
      });

      toast.success("Kuis selesai!");
      router.push(`/host/start-quiz/${params.id}/live/leaderboard`);
    }
  };

  const handleTimeUp = () => {
    if (quizFinished) return;
    autoNextTimeoutRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 5000);
  };

  const handleOptionClick = () => {
    handleNextQuestion();
  };
  
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

        {/* back */}
        <div className="relative w-full flex justify-end p-2 sm:p-4">
          {/* <button onClick={() => router.back()} className="">
            <Image
              src="/back.svg"
              alt="Back"
              width={150}
              height={150}
              className="object-cover"
              priority
            />
          </button> */}
          {!quizFinished && (
            <button onClick={() => handleOptionClick()} className="">
              <Image
                src="/next-q.svg"
                alt="Next"
                width={80}
                height={80}
                className="object-cover"
                priority
              />
            </button>
          )}
        </div>

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-6 flex-1 min-h-0">
          <div className="flex flex-row gap-4 md:gap-6 mb-3 flex-1 min-h-0 mx-2 sm:mx-4 md:mx-10 lg:mx-20">
            {/* Main Card List */}
            <div
              className="flex-1 items-start justify-start rounded-2xl sm:rounded-4xl relative overflow-hidden flex flex-col min-h-0 auto h-[calc(100vh-100px)]"
              style={{
                  backgroundImage: 'url(/bg-play.svg)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'top',
                  fontFamily: 'Varela Round',
                  backgroundRepeat: 'no-repeat',
                }}
              >
              <div className="relative w-full">
                {/* total question */}
                <div className="text-black text-base sm:text-xl md:text-2xl font-bold absolute top-4 sm:top-8 md:top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {currentQuestion + 1}/{questions?.length}
                </div>

                {/* timer */}
                <div className="text-red-600 text-lg sm:text-xl md:text-2xl font-bold absolute top-14 sm:top-18 md:top-22 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <QuizTimer timeLimit={questions?.[currentQuestion]?.timeLimit ?? 30} onTimeUp={handleTimeUp} />
                </div>

                {/* question */}
                <div className="text-black text-sm sm:text-lg md:text-2xl px-4 sm:px-12 md:px-24 w-full text-center font-bold absolute top-20 sm:top-26 md:top-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {questions?.[currentQuestion]?.text}
                </div>

                {/* image */}
                {questions?.[currentQuestion]?.imageUrl && (
                  <div className="absolute top-44 sm:top-56 md:top-70 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl h-[100px] sm:h-[140px] md:h-[180px]">
                    <img
                      src={questions?.[currentQuestion]?.imageUrl || "/images/bg-main.webp"}
                      alt="Quiz"
                      className="object-cover object-center rounded-xl w-full h-full"
                    />
                  </div>
                )}
                  
                {/* select question */}
                {questions?.[currentQuestion]?.type === 'ESSAY' ? (
                  <div className={`absolute ${questions?.[currentQuestion]?.imageUrl ? 'top-[280px] sm:top-[340px] md:top-96' : 'top-44 sm:top-56 md:top-70'} left-1/2 h-full transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[85%] md:w-[80%]`}>
                    <p className="text-amber-900 text-sm sm:text-lg md:text-2xl font-bold text-center">Sedang dijawab peserta ...</p>
                  </div>
                ) : (
                  <div className={`absolute ${questions?.[currentQuestion]?.imageUrl ? 'top-[280px] sm:top-[340px] md:top-96' : 'top-44 sm:top-56 md:top-70'} left-1/2 h-full transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[85%] md:w-[80%]`}>
                    <div className={`grid gap-2 sm:gap-3 md:gap-4 w-full ${questions?.[currentQuestion]?.options?.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {questions?.[currentQuestion]?.options?.map((option, index) => (
                      <div
                        key={index}
                        className="text-white text-xs sm:text-sm md:text-lg font-bold bg-[#5A3319] p-1.5 sm:p-2 sm:px-3 md:px-4 rounded-lg cursor-pointer hover:bg-[#6B4429] transition-colors"
                      >
                        {String.fromCharCode(65 + index)}. {option.text}
                      </div>
                    ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}