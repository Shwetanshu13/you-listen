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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-neutral-800 text-white rounded-lg max-w-lg"
    >
      <h2 className="text-xl font-semibold">Create New User</h2>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full p-2 rounded bg-neutral-700"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 rounded bg-neutral-700"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "user" | "admin")}
        className="w-full p-2 rounded bg-neutral-700"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
      >
        {loading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
