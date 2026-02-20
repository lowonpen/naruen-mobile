"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, setToken as saveToken, clearToken, isTokenExpired } from "@/lib/auth";
import { validateToken } from "@/lib/api";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 초기 토큰 확인
  useEffect(() => {
    const checkAuth = async () => {
      const stored = getToken();
      if (!stored || isTokenExpired(stored)) {
        clearToken();
        setIsLoading(false);
        return;
      }

      // 서버에 토큰 검증
      const valid = await validateToken();
      if (valid) {
        setTokenState(stored);
        setIsAuthenticated(true);
      } else {
        clearToken();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 로그인
  const login = useCallback(async (newToken: string): Promise<boolean> => {
    if (isTokenExpired(newToken)) return false;

    // 임시로 저장하고 검증
    saveToken(newToken);
    const valid = await validateToken();

    if (valid) {
      setTokenState(newToken);
      setIsAuthenticated(true);
      return true;
    } else {
      clearToken();
      return false;
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setIsAuthenticated(false);
  }, []);

  return { token, isLoading, isAuthenticated, login, logout };
}
