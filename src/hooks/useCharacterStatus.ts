"use client";

import { useState, useEffect, useCallback } from "react";
import { getStatus } from "@/lib/api";
import type { CharacterState, CharacterId } from "@/lib/types";

export function useCharacterStatus(characterId: CharacterId) {
  const [status, setStatus] = useState<CharacterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus(characterId);
      setStatus(data);
    } catch (err) {
      console.warn("[Status] 상태 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  // characterId 변경 시 이전 상태 즉시 초기화 + 새 상태 로드
  useEffect(() => {
    setStatus(null);
    setIsLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  // SSE state 이벤트로 업데이트
  const updateFromSSE = useCallback((state: CharacterState) => {
    setStatus(state);
  }, []);

  return { status, isLoading, refreshStatus: fetchStatus, updateFromSSE };
}
