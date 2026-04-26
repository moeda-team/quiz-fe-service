"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Search, Loader2 } from "lucide-react";
import { useQuizzes } from "@/hooks/useQuizzes";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { quizzes, isLoading, isFetchingMore, error, hasMore, loadMore } = useQuizzes(debouncedSearch);

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

  // Intersection Observer for Infinite Scroll
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isLoading, loadMore]);

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-main.svg"
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
          <div className="text-center">
            <div
              className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl text-black drop-shadow-xl tracking-wider text-shadow-lg text-shadow-amber-400 uppercase"
              style={{ fontFamily: 'Varela Round' }}
            >
              PANDAI KUIS
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto w-full shrink-0 mb-2">
          <div className="relative group">
            <input
              type="text"
              placeholder="Ketik disini untuk mencari kuis..."
              className="w-full py-3 md:py-4 px-6 md:px-8 rounded-full bg-amber-50/95 border-4 border-amber-700/50 text-amber-900 placeholder-amber-700/50 focus:outline-hidden focus:border-amber-700 shadow-2xl text-base md:text-lg transition-all duration-300 group-hover:shadow-amber-200/50"
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
          {/* People Illustration (Desktop only) */}
          <div className="hidden md:flex justify-start h-20 lg:h-36 -mb-10 ml-4 shrink-0">
            <img src="/images/people.svg" alt="people" className="h-full object-contain" />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 -mb-5 flex-1 min-h-0">
            {/* Main Card List */}
            <div
              className="flex-1 rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-0"
              style={{
                backgroundImage: 'url(/images/bg-card-list.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: 'Varela Round'
              }}
            >
              {/* Section Header with Search */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                  <img src="/images/icon-title-l.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                  <div className="text-2xl md:text-3xl text-amber-950 tracking-tight">
                    SEMUA KUIS
                  </div>
                  <img src="/images/icon-title-r.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                </div>

              </div>

              {/* Quiz Cards Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-amber-900 font-bold animate-pulse">Memuat kuis seru...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <span className="text-5xl mb-4">😰</span>
                    <p className="text-red-600 font-bold mb-2">Waduh, ada masalah!</p>
                    <p className="text-amber-800 text-sm">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-2 bg-amber-700 text-white rounded-full hover:bg-amber-800 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="text-6xl mb-4">🏜️</span>
                    <p className="text-amber-900 font-bold">Belum ada kuis nih.</p>
                    <p className="text-amber-700 text-sm">Ayo cari dengan kata kunci lain!</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-4">
                      {quizzes.map((quiz, index) => (
                        <div
                          key={`${quiz.id}-${index}`}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-amber-200 hover:border-amber-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full"
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
                            <h3 className="font-bold text-amber-950 mb-2 text-sm md:text-base line-clamp-2 leading-snug">
                              {quiz.title}
                            </h3>
                            <div className="mt-auto">
                              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {typeof quiz.questions === 'number' ? quiz.questions : (Array.isArray(quiz.questions) ? quiz.questions.length : 0)} Pertanyaan
                              </p>
                              <p className="text-[10px] md:text-xs text-amber-600/80 mt-1">
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
                        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-amber-200 shadow-sm">
                          <Loader2 className="w-5 h-5 text-amber-700 animate-spin" />
                          <span className="text-amber-900 font-bold text-sm">Memuat lebih banyak...</span>
                        </div>
                      ) : hasMore ? (
                        <div className="h-4" /> // Spacer for observer
                      ) : quizzes.length > 0 ? (
                        <div className="text-amber-700/60 text-sm font-medium">Sudah semua kuis dimuat ✨</div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row lg:flex-col gap-3 md:gap-4 justify-center items-center shrink-0 py-2">
              <Link href="#" className="lg:w-full transition-transform hover:scale-105 active:scale-95">
                <img src="/images/create.svg" alt="Create" className="w-full h-auto drop-shadow-lg" />
              </Link>
              <Link href="#" className="lg:w-full transition-transform hover:scale-105 active:scale-95">
                <img src="/images/start.svg" alt="Start" className="w-full h-auto drop-shadow-lg" />
              </Link>
              <button
                onClick={handleLogout}
                className="lg:w-full transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <img src="/images/exit.svg" alt="Exit" className="w-full h-auto drop-shadow-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings/Volume Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button className="w-12 h-12 md:w-14 md:h-14 bg-amber-100/90 rounded-full flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-amber-700/20 hover:bg-white transition-all group active:scale-90">
          <svg className="w-6 h-6 md:w-7 md:h-7 text-amber-700 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

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
