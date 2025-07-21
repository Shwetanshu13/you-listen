"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "@/utils/axios";

export default function CreateUserForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username and password are required");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/auth/create-user", {
        username,
        password,
        role,
      });

      toast.success("User created successfully");
      setUsername("");
      setPassword("");
      setRole("user");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Create New User</h2>
          <p className="text-gray-400">Add new users to your platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            >
              <option value="user" className="bg-gray-800">
                User
              </option>
              <option value="admin" className="bg-gray-800">
                Admin
              </option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create User</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
