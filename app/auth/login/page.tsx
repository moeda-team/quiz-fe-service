"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/redirect";

  const form = useForm<LoginFormData>({
    defaultValues: {
      // email: "admin@quizapp.com",
      // password: "admin123",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setErrorMsg(result?.error ?? "Email atau password salah.");
        return;
      }

      // Redirect to dashboard on successful login
      router.push(callbackUrl);
    } catch {
      setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <div className="hidden md:block">
        <Image
          src="/images/welcome.svg"
          alt="Login Card"
          width={100}
          height={100}
          className="w-3/12 fixed right-0 bottom-0 z-50 max-w-[200px] lg:max-w-[250px]"
        />
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-main.webp"
          alt="Background"
          fill
          className="object-cover sm:object-center md:object-center lg:object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-900/20 sm:to-amber-900/30 md:to-amber-900/40"></div>
      </div>

      <div className="relative z-0 min-h-screen flex items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="w-full lg:max-w-5xl xl:max-w-6xl flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {/* Center - Login Card */}
          <div className="relative w-full">
            {/* Card Background */}
            <div className="relative w-full sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-2xl mx-auto h-auto">
              <Image
                src="/images/login/card-login.webp"
                alt="Login Card"
                width={800}
                height={900}
                className="w-full h-auto"
              />

              {/* Form Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center lg:p-4 p-8">
                {/* Title */}
                <div className="text-center my-6">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-amber-900 mb-1 sm:mb-2 leading-tight" style={{ fontFamily: 'serif' }}>
                    Selamat Datang di Empat Rima
                  </h2>
                  <div className="relative w-full h-14 sm:h-14 md:h-14 lg:h-16 xl:h-20 2xl:h-24">
                    <Image
                      src="/images/login/quote.svg"
                      alt="Quote Banner"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="relative w-full my-1 mt-2 sm:mt-3 md:mt-4 lg:mt-6 xl:mt-8 text-xs sm:text-xs md:text-sm lg:text-base">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-900" style={{ fontFamily: 'serif' }}>
                      - Login untuk melanjutkan -
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50/90 border border-[#C9750A] text-red-700 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-xs md:text-sm max-w-full break-words">
                    {errorMsg}
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-2 md:space-y-6 w-full px-10 lg:px-20">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Email ..."
                              type="email"
                              className="bg-transparent border border-[#C9750A] rounded-lg px-2 py-2 sm:px-3 sm:py-2 md:px-3 md:py-3 text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 lg:h-11"
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                placeholder="Password ..."
                                type={showPassword ? "text" : "password"}
                                className="bg-transparent border border-amber-700 rounded-lg px-2 py-2 sm:px-3 sm:py-2 md:px-3 md:py-3 pr-8 sm:pr-10 text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 lg:h-11"
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                              >
                                {showPassword ? <EyeOff size={14} className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye size={14} className="w-3 h-3 sm:w-4 sm:h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col ">
                      <Button
                        type="submit"
                        className="relative hover:scale-105 transition-transform hover:bg-transparent w-full h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base"
                        disabled={isSubmitting}
                      >
                        <Image
                          src="/images/login/btn-login.webp"
                          alt="Login Button"
                          fill
                          className="object-contain"
                        />
                        <span className="relative z-10">Masuk</span>
                      </Button>
                      <Button
                        type="button"
                        className="relative hover:scale-105 transition-transform hover:bg-transparent w-full h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-white font-semibold text-xs sm:text-sm md:text-base"
                        disabled={isSubmitting}
                        onClick={()=>router.push('/quiziz')}
                      >
                        <Image
                          src="/images/login/btn-login.webp"
                          alt="Login Button"
                          fill
                          className="object-contain"
                        />
                        <span className="relative z-10">Masukan Kode</span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
