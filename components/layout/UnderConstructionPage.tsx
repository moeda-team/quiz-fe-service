// components/layout/UnderConstructionPage.tsx
"use client";

import Link from "next/link";
import { useCallback } from "react";
import { signOut } from "next-auth/react";
import { HardHat, ArrowLeft, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnderConstructionPage() {
  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/auth/login" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="font-semibold tracking-tight text-slate-900">
              Cogie
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs md:text-sm text-slate-500">
              Online Learning Platform
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-800 hover:bg-slate-100"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="text-xs sm:text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full text-center bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl px-6 py-10 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-6">
            <HardHat className="w-8 h-8 text-amber-600" />
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Halaman Sedang Dalam Pengembangan
          </h1>
          <p className="text-sm md:text-base text-slate-600 mb-6">
            Fitur ini belum siap digunakan. Kami sedang mengerjakannya agar
            pengalaman belajar kamu jadi lebih maksimal. 🚧
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="#" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto bg-black hover:bg-black/80 text-white"
            >
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Kalau kamu melihat ini di area tertentu (misalnya &quot;File
            Storage&quot; atau &quot;Message&quot;), berarti fitur tersebut
            masih dalam tahap pengembangan.
          </p>
        </div>
      </main>
    </div>
  );
}
