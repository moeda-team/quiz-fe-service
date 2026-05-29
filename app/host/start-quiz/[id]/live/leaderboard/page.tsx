"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useSession } from "next-auth/react";
import { QuizHistoryDetail } from "@/types/quiz";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { getHistoryDetail } = useQuizzes();

  const [leaderboardData, setLeaderboardData] = useState<QuizHistoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!params.id) return;

      const quizId = params.id as string;
      const hostId = session?.user?.id;
      const sessionId = getCookie(`quiz_session_${quizId}_${hostId}`);

      if (!sessionId) {
        console.log('No session ID found');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getHistoryDetail(sessionId);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [params.id, session, getHistoryDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading leaderboard...</div>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">No leaderboard data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-leaderboard.svg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <GlobalMusicPlayer />

      <div className="relative w-full flex justify-end p-4">
        <button 
          onClick={() => {
            router.push(`/host/start-quiz/${params.id}/history`);
            document.cookie.split(";").forEach((cookie) => {
              const cookieName = cookie.split("=")[0].trim();

              if (cookieName.startsWith("quiz_session_")) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              }
            });
          }} 
        >
          <Image
            src="/end.svg"
            alt="End"
            width={150}
            height={150}
            className="object-cover"
            priority
          />
        </button>
      </div>
      
      <div className="relative z-10 ">
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
            <div className="absolute top-13 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <h1 className="text-lg font-bold text-gray-800">
                {leaderboardData.leaderboard.length > 1 ? leaderboardData.leaderboard[1].name.length > 10 ? leaderboardData.leaderboard[1].name.substring(0, 10) + '...' : leaderboardData.leaderboard[1].name : 'N/A'}
              </h1>
            </div>
            <div className="absolute top-26 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
            <div className="absolute top-18 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <h1 className="text-lg font-bold text-gray-800">
                {leaderboardData.leaderboard.length > 0 ? leaderboardData.leaderboard[0].name.length > 10 ? leaderboardData.leaderboard[1].name.substring(0, 10) + '...' : leaderboardData.leaderboard[1].name : 'N/A'}
              </h1>
            </div>
            <div className="absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
            <div className="absolute top-13 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <h1 className="text-lg font-bold text-gray-800">
                {leaderboardData.leaderboard.length > 2 ? leaderboardData.leaderboard[2].name.length > 10 ? leaderboardData.leaderboard[1].name.substring(0, 10) + '...' : leaderboardData.leaderboard[1].name : 'N/A'}
              </h1>
            </div>
            <div className="absolute top-26 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
          className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl  border-4 border-amber-500"
          style={{
            backgroundImage: 'url(/images/bg-card-list.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: 'Varela Round',
          }}
        >
          <div className="max-h-[380px] overflow-y-auto rounded-lg">
            <table className="border-separate w-full mb-1 px-0.5">
              <thead className="sticky top-0 z-10">
                <tr className="text-white border-b-2 border-gray-300 bg-amber-800">
                  <th className="text-left py-2 px-4 rounded-tl-lg w-12">
                    Rank
                  </th>

                  <th className="text-left py-2 px-4">
                    Name
                  </th>

                  <th className="text-right py-2 px-4 rounded-tr-lg">
                    Score
                  </th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {leaderboardData.leaderboard?.map((participant, i) => (
                  <tr
                    key={participant.participantId}
                    className={`
                      hover:bg-gray-100
                      ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      border-b border-gray-200
                    `}
                  >
                    <td className="py-2 px-4 font-bold">
                      {participant.rank}
                    </td>

                    <td className="py-2 px-4">
                      {participant.name}
                    </td>

                    <td className="py-2 px-4 text-right font-bold">
                      {participant.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}