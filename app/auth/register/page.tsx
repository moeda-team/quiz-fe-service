"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isLoading, error: apiError, resetError } = useRegister();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    resetError();

    // validasi front-end
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setFormError("Please agree to the terms and conditions.");
      return;
    }

    // hit API lewat hook
    const result = await register({ name, email, password, confirmPassword });

    if (!result.ok) {
      // error detail sudah di `apiError`, tapi kalau mau override bisa pakai result.message
      return;
    }
    
    // sukses -> redirect ke login
    router.push("/auth/login?registered=1");
  };

  const handleNavigateToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex lg:p-10 p-4 bg-[rgb(249,250,251)]">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1e] to-[#0a0a0a] rounded-3xl">
        {/* Glowing Circle with Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-purple-600 via-purple-500 to-blue-500 opacity-90 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-purple-500 to-blue-400" />

        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full rounded-[40px]">
          <div>
            <p className="text-sm tracking-widest uppercase opacity-80">
              LEARN & GROW
            </p>
          </div>

          <div>
            <h1
              className="text-6xl mb-4 leading-tight text-white"
              style={{ fontFamily: "serif" }}
            >
              Start Your
              <br />
              Learning
              <br />
              Journey
            </h1>
            <p className="text-white/80 max-w-md">
              Join thousands of learners and unlock your potential.
              <br />
              Create an account to get started today.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-black">
        <div className="w-full max-w-md border p-8 rounded-lg">

          <div className="mb-8 text-center">
            <h2 className="mb-2" style={{ fontFamily: "serif" }}>
              Create Account
            </h2>
            <p className="text-gray-600">
              Fill in your details to create a new account
            </p>
          </div>
          
          {(formError || apiError) && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {formError ?? apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-100 border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-100 border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-100 border-0 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-gray-100 border-0 pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) =>
                  setAgreeToTerms(checked as boolean)
                }
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <button
                  type="button"
                  className="hover:underline"
                >
                  Terms and Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
            >
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
              Sign Up with Google
            </Button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Already have an account?{" "}
            <button
              onClick={handleNavigateToLogin}
              className="text-black hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
