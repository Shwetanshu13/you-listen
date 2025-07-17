// components/AuthGuard.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import React from "react";

const PUBLIC_ROUTES = ["/login", "/landing"];

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

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
