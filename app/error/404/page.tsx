// app/not-found.tsx
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(249,250,251)] px-4">
      <div className="max-w-3xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        {/* Left: Text */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-3">
            COGIE LEARNING PLATFORM
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            404 – Page not found
          </h1>

          <p className="text-gray-600 mb-8">
            Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
            Periksa kembali URL, atau kembali ke dashboard / beranda.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/auth/redirect">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition-colors">
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>

        {/* Right: Decorative */}
        <div className="hidden lg:flex relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1e] to-[#0a0a0a] h-72">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-gradient-to-b from-purple-600 via-purple-500 to-blue-500 opacity-80 blur-3xl" />
          <div className="absolute bottom-0 left-8 text-[6rem] leading-none text-white/10 font-semibold">
            404
          </div>
          <div className="relative z-10 p-8 flex flex-col justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">
                LOST?
              </p>
              <p className="text-lg font-semibold">
                Let&apos;s get you back <br /> to learning.
              </p>
            </div>
            <p className="text-xs text-white/60 max-w-xs">
              Navigasi menggunakan menu utama atau kembali ke dashboard untuk
              melanjutkan progress kelas kamu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
