"use client";

import { useState } from "react";

interface LoginFormProps {
  onLogin: (token: string) => Promise<boolean>;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("토큰을 입력해주세요");
      return;
    }

    setIsLoading(true);
    setError("");

    const success = await onLogin(token.trim());
    if (!success) {
      setError("유효하지 않거나 만료된 토큰이에요");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
          접속 토큰
        </label>
        <textarea
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="JWT 토큰을 붙여넣기 해주세요..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !token.trim()}
        className="w-full py-2.5 bg-pink-400 text-white rounded-lg font-medium hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "확인 중..." : "접속하기"}
      </button>
    </form>
  );
}
