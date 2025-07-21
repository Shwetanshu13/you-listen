// components/ProfileCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { useEffect, useState, useCallback } from "react";

export default function ProfileCard() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-pink-500/20 animate-ping" />
        </div>
        <p className="text-gray-400 text-lg">Loading your profile...</p>
      </div>
    );

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
        <div className="relative glass rounded-3xl p-8">
          <div className="text-center space-y-6">
            {/* Avatar */}
            <div className="relative mx-auto w-32 h-32">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-ping opacity-20" />

              {/* Role Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  }`}
                >
                  {user.role === "admin" ? "👑 Admin" : "🎵 User"}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {user.username}
              </h1>
              <p className="text-gray-400 text-lg">
                Welcome back to your music sanctuary
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl">🎵</span>
          </div>
          <h3 className="text-2xl font-bold text-white">∞</h3>
          <p className="text-gray-400">Songs Available</p>
        </div>

        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-xl">⚡</span>
          </div>
          <h3 className="text-2xl font-bold text-white">HD</h3>
          <p className="text-gray-400">Audio Quality</p>
        </div>

        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <span className="text-white text-xl">🔄</span>
          </div>
          <h3 className="text-2xl font-bold text-white">24/7</h3>
          <p className="text-gray-400">Access</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={handleLogout} className="btn-secondary">
          <span>Sign Out</span>
        </button>

        {user.role === "admin" && (
          <button
            onClick={() => (window.location.href = "/admin")}
            className="btn-primary"
          >
            <span>Admin Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
}
