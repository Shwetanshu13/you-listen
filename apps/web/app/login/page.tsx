// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { Music, User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Music className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 animate-ping opacity-20" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            You Listen
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Sign in to your music sanctuary
          </p>
        </div>

        {/* Login Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
          <div className="relative glass rounded-3xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Welcome to the future of music streaming
              </p>
              <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
                <span>• High Quality Audio</span>
                <span>• Unlimited Access</span>
                <span>• Fast Streaming</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
