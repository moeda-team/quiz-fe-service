"use client"

import { useEffect, useState } from "react";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Quiz, QuizHistory, QuizHistoryDetail } from "@/types/quiz";
import { toast } from "sonner";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "date-fns";
import Loading from "@/components/button/Loading";

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuizById, getHistory, getHistoryDetail } = useQuizzes();
  
  const [quizdata, setQuizdata] = useState<Quiz | null>(null);
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [historyDetail, setHistoryDetail] = useState<QuizHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id) return;
      try {
        const response = await getQuizById(params.id as string);
        if (!response) return;

        const quizData: Quiz = ('data' in response && response.data) ? response.data : response as Quiz;

        setQuizdata(quizData);
      } catch {
        toast.error("Gagal mengambil data kuis");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params.id, getQuizById]);
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!params.id) return;
      try {

        const response = await getHistory(params.id as string);
        if (!response) return;

        setHistory(response);

      } catch {
        toast.error("Gagal mengambil data history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [params.id, getHistory]);

  const handleGetHistoryDetail = async (id: string) => {
    try {
      const response = await getHistoryDetail(id);
      if (!response) return;
      setHistoryDetail(response);
    } catch {
      toast.error("Gagal mengambil data history");
    }
  };
  
  if (loading) {
    return <Loading fullscreen text="Memuat data..." />;
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

        {/* back */}
        <div className="relative w-full flex justify-start p-4">
          <button onClick={() => router.push(`/host/start-quiz`)} className="">
            <Image
              src="/back.svg"
              alt="Back"
              width={150}
              height={150}
              className="object-cover"
              priority
            />
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-6 flex-1 min-h-0">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-3 flex-1 min-h-0 mx-20">
            {/* Main Card List */}
            <div
              className="flex-1 rounded-4xl p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-0 h-[calc(100vh-100px)]"
              style={{
                  backgroundImage: 'url(/images/bg-card-list.webp)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  fontFamily: 'Varela Round',
                }}
              >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className=" rounded-2xl flex flex-col gap-4 col-span-2 min-h-[calc(100vh-140px)]">
                  <div className="w-full h-56 rounded-lg relative">
                    <img
                      src={quizdata?.coverImage || "/images/bg-main.webp"}
                      alt="Quiz 1"
                      className="object-cover rounded-lg h-56 w-full"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                    <div className="absolute bottom-0 left-0 right-0 text-white bg-black/50 rounded-b-lg p-2">
                      <h3 className="text-xl font-bold">{quizdata?.title}</h3>
                      <p className="text-sm">{quizdata?.instructions}</p>
                      <button 
                        className="absolute bottom-2 right-2 hover:scale-105 transition-transform hover:bg-transparent w-28 h-10 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base"
                        onClick={() => {
                          router.replace(`/host/start-quiz/${quizdata?.id}`)
                        }}
                      >
                        <Image
                          src="/bg-start.svg"
                          alt="Login div"
                          fill
                          className="object-contain"
                        />
                        <span className="relative z-10 text-white" style={{ fontFamily: 'Varela Round, serif' }}>Mulai Kuis</span>
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-96 overflow-auto bg-[#291B13] rounded-lg text-white">
                    <Table className="border-white">
                      <TableHeader>
                        <TableRow className="border-white hover:bg-transparent">
                          <TableHead className="text-white px-2 text-center w-12">No.</TableHead>
                          <TableHead className="text-white px-2 text-center">Tanggal Kuis</TableHead>
                          <TableHead className="text-white px-2 text-center">Peserta</TableHead>
                          <TableHead className="text-white px-2 text-center">Join Code</TableHead>
                          <TableHead className="text-white px-2 text-center">Status</TableHead>
                          <TableHead className="text-white px-2 text-center w-24">#</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="border-white max-h-96 overflow-y-auto">
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              Tidak ada riwayat kuis
                            </TableCell>
                          </TableRow>
                        ) : (
                        history.map((item, index) => (
                          <TableRow key={item.id} className="border-white hover:bg-transparent">
                            <TableCell className="px-2 text-center">{index + 1}</TableCell>
                            <TableCell className="px-2 text-center">{formatDate(item.startedAt, 'dd MMM yyyy HH:mm')}</TableCell>
                            <TableCell className="px-2 text-center">{item.participantCount}</TableCell>
                            <TableCell className="px-2 text-center">{item.joinCode}</TableCell>
                            <TableCell className="px-2 text-center">{item.status}</TableCell>
                            <TableCell className="px-2 text-center">
                              <button
                                className="bg-[#F2C94C] text-black px-2 py-1 rounded hover:bg-[#e6b82a] transition-colors"
                                title="Lihat Detail"
                                onClick={() => {
                                  handleGetHistoryDetail(item.id);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="bg-[#291B13] rounded-2xl p-4 shadow-lg text-white">
                  <div className="text-center text-lg font-bold mb-2">
                    Overview {historyDetail && historyDetail?.session?.startedAt && formatDate(historyDetail?.session?.startedAt, 'dd MMM yyyy')}
                  </div>
                  <div className="flex flex-col gap-2">
                    {historyDetail ? (
                      historyDetail?.leaderboard.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#3D2B20] rounded-sm p-2">
                          <p>#{item.rank} {item.name}</p>
                          <p>{item.score}pts</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}