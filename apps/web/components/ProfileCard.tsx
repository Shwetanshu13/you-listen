"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc"; // 👈 uses tRPC hook
import axios from "axios";

export default function ProfileCard() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {
        withCredentials: true,
      });
      toast.success("Logged out");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Redirect if unauthenticated
  if (!user && !isLoading) {
    router.push("/login");
    return null;
  }

  if (isLoading) return <p className="text-white">Loading profile...</p>;
  if (error) return <p className="text-red-500">Error loading user</p>;

  return (
    <div className="bg-neutral-800 text-white p-6 rounded-md w-full max-w-md shadow-lg space-y-4">
      <h2 className="text-xl font-bold">Profile</h2>

      <div className="space-y-2">
        <p>
          <span className="font-semibold">Username:</span> {user?.username}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {user?.role}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded text-white"
      >
        Logout
      </button>
    </div>
  );
}
