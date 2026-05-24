"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useQuizzes } from "@/hooks/useQuizzes";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardAdminPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const { quizzes, isLoading, isFetchingMore, error, hasMore, loadMore } = useQuizzes(debouncedSearch);

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading && !isFetchingMore) {
      loadMore();
    }
  }, [hasMore, isLoading, isFetchingMore, loadMore]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (observerTarget.current) {
      observerRef.current.observe(observerTarget.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);


  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-main.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col pt-6 md:pt-10 pb-4 md:pb-6 px-4 sm:px-6 lg:px-8 min-h-0">
        {/* Header */}
        <header className="mb-4 md:mb-6 shrink-0">
          <div className="text-center cursor-pointer" onClick={() => router.push('/')}>
            <div
              className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-black drop-shadow-xl tracking-wider text-shadow-lg text-shadow-amber-400 uppercase"
              style={{ fontFamily: 'Varela Round' }}
            >
              Empat Rima
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto w-full shrink-0 mb-2">
          <div className="relative group">
            <input
              type="text"
              placeholder="Ketik disini untuk mencari kuis..."
              className="w-full py-2 md:py-2 px-6 md:px-8 rounded-full bg-amber-50/95 border-4 border-[#C9750A]/50 text-amber-900 placeholder-amber-700/50 focus:outline-hidden focus:border-[#C9750A] shadow-2xl text-base md:text-lg transition-all duration-300 group-hover:shadow-amber-200/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-amber-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-6 flex-1 min-h-0">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-3 flex-1 min-h-0">
            {/* Main Card List */}
            <div
              className="flex-1 rounded-[2rem] md:rounded-[3rem] p-4 shadow-2xl relative overflow-hidden flex flex-col min-h-0"
              style={{
                backgroundImage: 'url(/images/bg-card-list.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: 'Varela Round'
              }}
            >
              {/* Section Header with Search */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                  <img src="/images/icon-title-l.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                  <div className="text-xl md:text-1xl text-amber-950 tracking-tight">
                    PILIH KUIS UNTUK MULAI
                  </div>
                  <img src="/images/icon-title-r.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                </div>

              </div>

              {/* Quiz Cards Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-16 h-16 border-4 border-[#C9750A] border-t-transparent rounded-full animate-spin" />
                  <div className="text-black font-bold animate-pulse">Memuat kuis seru...</div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <span className="text-5xl mb-4">😰</span>
                    <p className="text-black font-bold mb-2">Waduh, ada masalah!</p>
                    <p className="text-black text-sm">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="text-6xl mb-4">🏜️</span>
                    <p className="text-black font-bold">Belum ada kuis nih.</p>
                    <p className="text-black text-sm">Ayo cari dengan kata kunci lain!</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 pb-4">
                      {quizzes.map((quiz, index) => (
                        <div
                          key={`${quiz.id}-${index}`}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-[#C9750A] hover:border-[#C9750A] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                        >
                          <div className="aspect-video bg-linear-to-br from-amber-100 to-amber-300 flex items-center justify-center relative overflow-hidden">
                            {quiz.coverImage ? (
                              <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-4xl md:text-5xl group-hover:scale-125 transition-transform duration-500">📚</span>
                            )}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                          </div>
                          <div className="p-4 flex flex-col flex-1 bg-amber-50/30">
                            <h3 className="font-bold text-black mb-2 text-sm md:text-base line-clamp-2 leading-snug">
                              {quiz.title}
                            </h3>
                            <div className="mt-auto">
                              <p className="text-[10px] md:text-xs text-black/80 mt-1">
                                By {quiz.author || "Anonim"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div ref={observerTarget} className="py-8 flex justify-center w-full">
                      {isFetchingMore ? (
                        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-[#C9750A] shadow-sm">
                          <Loader2 className="w-5 h-5 text-amber-700 animate-spin" />
                          <span className="text-black font-bold text-sm">Memuat lebih banyak...</span>
                        </div>
                      ) : hasMore ? (
                        <div className="flex justify-center py-4">
                          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-[#C9750A] shadow-sm">
                            <Loader2 className="w-5 h-5 text-amber-700 animate-spin" />
                            <span className="text-black font-bold text-sm">Memuat lebih banyak...</span>
                          </div>
                        </div>
                      ) : quizzes.length > 0 ? (
                        <div className="text-center py-4">
                          <div className="text-black text-sm font-medium">Sudah semua kuis dimuat ✨</div>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Music Player */}
      <GlobalMusicPlayer />

      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(120, 53, 15, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 53, 15, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 53, 15, 0.5);
        }
      `}</style>
    </div>
  );
}
