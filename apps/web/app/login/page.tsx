// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axios.post("/api/login", { username, password });

      router.push("/"); // Or wherever the protected page is
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white px-4">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-800 p-6 rounded shadow-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        <div>
          <label htmlFor="username" className="block mb-1 text-sm">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full px-3 py-2 rounded bg-neutral-700 text-white outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 rounded bg-neutral-700 text-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 rounded bg-pink-600 hover:bg-pink-700 transition cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
