"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) return <div>Loading...</div>; // replace with your loader
  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
