"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/me");
        if (data.role !== "admin") {
          router.replace("/");
        } else {
          setUser(data);
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
