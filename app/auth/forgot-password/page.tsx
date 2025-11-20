// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: di sini nanti panggil API /api/forgot-password
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-black">
      <div className="w-full max-w-md">
        {!isSubmitted ? (
          <Card>
            <CardContent className="pt-6 pb-8 px-8">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 -ml-2 text-black"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="mb-2">Forgot Password?</h2>
                <p className="text-gray-600">
                  No worries, we&apos;ll send you reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  Reset Password
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-8 px-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-6 text-black">
                  We&apos;ve sent a password reset link to
                  <br />
                  <span className="text-gray-900">{email}</span>
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 hover:underline"
                    >
                      try another email address
                    </button>
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center mt-6 text-gray-600 text-black">
          Remember your password?{" "}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-black hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
