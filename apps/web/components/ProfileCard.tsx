// components/ProfileCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import axios from "axios";

export default function ProfileCard() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  if (isLoading)
    return (
      <div className="text-white p-6">
        <p className="animate-pulse text-neutral-400">Loading profile...</p>
      </div>
    );

  if (error || !user) {
    router.push("/login");
    return null;
  }

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
