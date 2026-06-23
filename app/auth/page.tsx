"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-main.webp"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-900/30 sm:to-amber-900/40" />
      </div>

      {/* Decorative welcome image - desktop only */}
      <div className="hidden md:block">
        <Image
          src="/images/welcome.svg"
          alt="Welcome"
          width={150}
          height={150}
          className="w-3/12 fixed right-0 bottom-0 z-50 max-w-[200px] lg:max-w-[250px]"
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8">
        <div className="mx-auto w-full max-w-[320px] sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="relative">
            {/* Card background image */}
            <Image
              src="/images/login/card-login.webp"
              alt="Auth Card"
              width={800}
              height={900}
              className="w-full h-auto"
            />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12">
              {/* Title */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <h1
                  className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-amber-900 mb-2 leading-tight"
                  style={{ fontFamily: "serif" }}
                >
                  Selamat Datang di Empat Rima
                </h1>
                <div className="relative w-full h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24">
                  <Image
                    src="/images/login/quote.svg"
                    alt="Quote Banner"
                    fill
                    className="object-contain"
                  />
                </div>
                <p
                  className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-amber-900"
                  style={{ fontFamily: "serif" }}
                >
                  - Pilih menu untuk melanjutkan -
                </p>
              </div>

              {/* Action buttons */}
              <div className="w-full space-y-3 sm:space-y-4 px-4 sm:px-6 md:px-10 lg:px-14">
                <Link href="/auth/login" className="block">
                  <Button
                    type="button"
                    className="relative w-full h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16 bg-transparent hover:bg-transparent border-0 cursor-pointer flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base hover:scale-105 transition-transform"
                  >
                    <Image
                      src="/images/login/btn-login.webp"
                      alt="Login Button"
                      fill
                      className="object-contain"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                      Masuk
                    </span>
                  </Button>
                </Link>

                <Link href="/auth/register" className="block">
                  <Button
                    type="button"
                    className="relative w-full h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16 bg-transparent hover:bg-transparent border-0 cursor-pointer flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base hover:scale-105 transition-transform"
                  >
                    <Image
                      src="/images/login/btn-login.webp"
                      alt="Register Button"
                      fill
                      className="object-contain"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Daftar
                    </span>
                  </Button>
                </Link>

                <Link href="/auth/forgot-password" className="block">
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-amber-900 hover:text-amber-700 text-xs sm:text-sm md:text-base underline-offset-4 hover:underline"
                  >
                    <KeyRound className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Lupa Password?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
