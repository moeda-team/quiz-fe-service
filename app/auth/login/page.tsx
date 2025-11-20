"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/redirect";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // biar kita kontrol sendiri
      callbackUrl,
    });

    setIsSubmitting(false);

    // ❌ Login gagal
    if (!result || result.error) {
      console.log(result);
      setErrorMsg(result?.error ?? "Email atau password salah.");
      return;
    }

    // ✅ Login sukses → arahkan user ke callbackUrl
    router.push(result.url ?? callbackUrl);
  };

  const handleRememberChange = (checked: CheckedState) => {
    const isChecked = checked === true;
    setRememberMe(isChecked);

    if (isChecked) {
      localStorage.setItem("remember_email", email);
    } else {
      localStorage.removeItem("remember_email");
    }
  };

  const handleNavigateToRegister = () => router.push("/auth/register");
  const handleNavigateToForgotPassword = () =>
    router.push("/auth/forgot-password");

  const handleSignInWithGoogle = () => {
    void signIn("google", {
      callbackUrl,
    });
  };

  return (
    <div className="min-h-screen flex lg:p-10 p-4 bg-[rgb(249,250,251)]">
      {/* Left Side (Design) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1e] to-[#0a0a0a] rounded-3xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-purple-600 via-purple-500 to-blue-500 opacity-90 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-purple-500 to-blue-400" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full rounded-[40px]">
          <p className="text-sm tracking-widest uppercase opacity-80">
            LEARN &amp; GROW
          </p>
          <div>
            <h1
              className="text-6xl mb-4 leading-tight text-white"
              style={{ fontFamily: "serif" }}
            >
              Master
              <br />
              Every
              <br />
              Subject
            </h1>
            <p className="text-white/80 max-w-md">
              Challenge yourself with interactive quizzes and courses.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-black">
        <div className="w-full max-w-md border p-8 rounded-lg bg-white">
          <div className="mb-8 text-center">
            <h2
              className="mb-2 text-2xl font-semibold"
              style={{ fontFamily: "serif" }}
            >
              Welcome Back
            </h2>
            <p className="text-gray-900">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-gray-100 border-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-100 border-0 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={handleRememberChange}
                />
                <label htmlFor="remember" className="text-sm">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleNavigateToForgotPassword}
                className="text-sm hover:underline"
              >
                Forgot Password
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignInWithGoogle}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign In with Google
              </div>
            </Button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={handleNavigateToRegister}
              className="text-black hover:underline"
            >
              Sign Up
            </button>
          </p>
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
