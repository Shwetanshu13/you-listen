// components/ProfileCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { useEffect, useState } from "react";

export default function ProfileCard() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/me");
      setUser(data);
    } catch (error) {
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  if (loading)
    return (
      <div className="text-white p-6">
        <p className="animate-pulse text-neutral-400">Loading profile...</p>
      </div>
    );

  if (!user) return null;

  return (
    <div className="bg-neutral-900 text-white p-6 rounded-xl shadow-xl max-w-md w-full space-y-4 mx-auto mt-10 border border-neutral-700">
      <h2 className="text-2xl font-semibold">👤 Profile</h2>

      <div className="space-y-2 text-sm">
        <p>
          <span className="text-neutral-400">Username:</span> {user.username}
        </p>
        <p>
          <span className="text-neutral-400">Role:</span> {user.role}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-pink-600 hover:bg-pink-700 transition px-4 py-2 rounded-md font-medium text-sm"
      >
        Logout
      </button>
    </div>
  );
}
