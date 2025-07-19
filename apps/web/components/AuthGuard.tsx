// components/AuthGuard.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import React from "react";

const PUBLIC_ROUTES = ["/login", "/landing"];

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !isPublic) {
      router.replace("/login");
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [isLoading, user, isPublic, router]);

  if (!isPublic && (isLoading || !user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
