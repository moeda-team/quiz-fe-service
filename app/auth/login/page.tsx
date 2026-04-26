"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/redirect";

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "admin@quizapp.com",
      password: "admin123",
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
      window.location.href = "/auth/redirect";
    } catch {
      setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <Image
        src="/images/welcome.svg"
        alt="Login Card"
        width={100}
        height={100}
        className="w-3/12 fixed right-0 bottom-0 z-50"
      />

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
      <div className="relative z-0 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-4xl flex items-center justify-center gap-8">
          {/* Center - Login Card */}
          <div className="relative w-full">
            {/* Card Background */}
            <div className="relative w-full max-w-[650px] mx-auto h-auto">
              <Image
                src="/images/login/card.svg"
                alt="Login Card"
                width={800}
                height={900}
                className="w-full h-auto"
              />

              {/* Form Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                {/* Title */}
                <div className="text-center mb-2 sm:mb-3">
                  <h2 className="text-sm lg:text-xl sm:text-2xl font-bold text-amber-900 m-2" style={{ fontFamily: 'serif' }}>
                    Selamat Datang di PANDAI KUIS
                  </h2>
                  <div className="relative w-full h-16 sm:h-20 md:h-24">
                    <Image
                      src="/images/login/quote.png"
                      alt="Quote Banner"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 translate-y-1 flex flex-col items-center justify-center text-amber-900 text-xs lg:text-sm sm:text-base" style={{ fontFamily: 'serif' }}>
                      Belajar seru, kuis asyik, jadi pandai
                    </div>
                  </div>
                  <div className="relative w-full my-2 mt-4 sm:mt-6 md:mt-10 text-xs sm:text-sm">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-900" style={{ fontFamily: 'serif' }}>
                      - Login untuk melanjutkan -
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {errorMsg}
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-[60%] mt-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="bg-transparent border border-amber-700 rounded-lg px-3 py-2"
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
                                type={showPassword ? "text" : "password"}
                                className="bg-transparent border border-amber-700 rounded-lg px-3 py-2 pr-10"
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="relative hover:scale-105 transition-transform hover:bg-transparent w-full sm:h-14 md:h-16 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <Image
                        src="/images/login/btn-login.svg"
                        alt="Login Button"
                        fill
                        className="object-contain"
                      />
                    </Button>
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
