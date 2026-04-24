"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

const quizzes = [
  {
    id: 1,
    title: "Pre Test - Mengenal Budaya Bali",
    questions: 1,
    author: "Malasari",
    image: "/images/bali-culture.jpg",
  },
  {
    id: 2,
    title: "Post Test - Pantun Berirama",
    questions: 1,
    author: "Rizal Maidan",
    image: "/images/pantun.jpg",
  },
  {
    id: 3,
    title: "Pre Test - Sejarah Indonesia 1945",
    questions: 1,
    author: "Rizal Maidan",
    image: "/images/sejarah.jpg",
  },
];

export default function HomePage() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-6 pb-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 drop-shadow-lg tracking-wide" style={{ fontFamily: 'serif' }}>
              PANDAI KUIS
            </h1>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-4 md:px-8 max-w-4xl mx-auto w-full mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik disini untuk mencari kuis..."
              className="w-full py-2 sm:py-3 px-4 sm:px-6 rounded-full bg-amber-50/90 border-2 border-amber-700/30 text-amber-900 placeholder-amber-700/50 focus:outline-hidden focus:border-amber-700 shadow-lg text-sm sm:text-base"
            />
            <svg
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>


        {/* Main Content Area */}
        <div className="flex-1 px-4 md:px-8 pb-6 sm:pb-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Left Side - Quiz List */}
            <div className="flex-1">
              <div className="bg-amber-50/95 rounded-2xl p-3 sm:p-4 md:p-6 shadow-2xl border border-amber-200">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🌸</span>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-900">
                    Semua Kuis
                  </h2>
                  <span className="text-xl sm:text-2xl">🌸</span>
                </div>

                {/* Quiz Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md border border-amber-200 hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      <div className="h-20 sm:h-24 md:h-32 bg-linear-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl md:text-4xl">📚</span>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-bold text-amber-900 mb-1 sm:mb-2 text-xs sm:text-sm leading-tight">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-amber-700 mb-1">
                          {quiz.questions} Pertanyaan
                        </p>
                        <p className="text-xs text-amber-600">
                          Published by {quiz.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="w-full md:w-48 flex flex-col gap-2 sm:gap-3">
              <Link
                href="/admin"
                className="bg-amber-100/90 hover:bg-amber-200/90 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-lg border border-amber-300 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-300 flex items-center justify-center text-sm sm:text-lg">
                  ✏️
                </div>
                <span className="font-bold text-amber-900 text-sm sm:text-base">Buat Kuis</span>
              </Link>
              <div
                onClick={handleLogout}
                className="bg-red-100/90 hover:bg-red-200/90 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-lg border border-red-300 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-300 flex items-center justify-center text-sm sm:text-lg">
                  🔐
                </div>
                <span className="font-bold text-red-900 text-sm sm:text-base">logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-20">
        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100/80 rounded-full flex items-center justify-center shadow-lg border border-amber-300">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
