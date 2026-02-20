"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenExpired } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🐰</div>
        <p className="text-sm text-gray-400">로딩 중...</p>
      </div>
    </div>
  );
}
