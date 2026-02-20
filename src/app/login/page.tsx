"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* 로고 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🐰</div>
        <h1 className="text-2xl font-bold text-gray-800">송나른</h1>
        <p className="text-sm text-gray-400 mt-1">나른이와 나린이에게 말걸기</p>
      </div>

      {/* 로그인 폼 */}
      <LoginForm
        onLogin={async (token) => {
          const success = await login(token);
          if (success) {
            router.replace("/chat");
          }
          return success;
        }}
      />
    </div>
  );
}
