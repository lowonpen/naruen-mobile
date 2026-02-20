"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";
import type { ChatMessage, CharacterId, SiblingEvent } from "@/lib/types";

function generateId(): string {
  return "sib-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * 자매 대화 SSE 지속 연결 훅
 *
 * GET /api/sibling/events?character_id=X 를 열어두고,
 * 자매 대화 이벤트가 오면 ChatMessage[] 에 추가.
 * 자동 재연결 + heartbeat 처리.
 */
export function useSiblingEvents(characterId: CharacterId) {
  const [siblingMessages, setSiblingMessages] = useState<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isConnectedRef = useRef(false);
  const characterIdRef = useRef(characterId);
  characterIdRef.current = characterId;

  // 자매 이벤트 처리
  const handleSiblingEvent = useCallback((event: SiblingEvent) => {
    switch (event.type) {
      case "sibling_speak": {
        const msg: ChatMessage = {
          id: generateId(),
          role: "sibling",
          content: event.content,
          timestamp: new Date(event.timestamp || Date.now()),
          isSibling: true,
          siblingName: event.speaker_name,
          siblingId: event.speaker,
        };
        setSiblingMessages((prev) => [...prev, msg]);
        break;
      }
      case "sibling_typing":
        // 타이핑 인디케이터는 나중에 추가 가능
        break;
      case "sibling_done":
        // 완료 신호 — 현재는 별도 처리 없음
        break;
    }
  }, []);

  // SSE 연결 (ref 기반으로 순환 의존 제거)
  useEffect(() => {
    let cancelled = false;

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      reconnectTimerRef.current = setTimeout(() => {
        if (!cancelled && !isConnectedRef.current) {
          connectSSE();
        }
      }, 5000);
    };

    const connectSSE = async () => {
      if (isConnectedRef.current || cancelled) return;

      const token = getToken();
      if (!token) return;

      const abort = new AbortController();
      abortRef.current = abort;
      isConnectedRef.current = true;

      try {
        const response = await fetch(
          `${API_URL}/api/sibling/events?character_id=${characterIdRef.current}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abort.signal,
          }
        );

        if (!response.ok) {
          console.warn("[SiblingSSE] 연결 실패:", response.status);
          isConnectedRef.current = false;
          scheduleReconnect();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          isConnectedRef.current = false;
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            // SSE 파싱
            let eventType = "";
            let data = "";
            for (const line of trimmed.split("\n")) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7);
              } else if (line.startsWith("data: ")) {
                data = line.slice(6);
              }
            }

            // heartbeat 무시
            if (eventType === "heartbeat") continue;
            if (!data) continue;

            try {
              const event = JSON.parse(data) as SiblingEvent;
              handleSiblingEvent(event);
            } catch {
              console.warn("[SiblingSSE] JSON 파싱 실패:", data);
            }
          }
        }

        reader.releaseLock();
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.warn("[SiblingSSE] 연결 오류:", err);
      } finally {
        isConnectedRef.current = false;
      }

      // 연결 끊기면 재연결
      if (!cancelled) {
        scheduleReconnect();
      }
    };

    connectSSE();

    return () => {
      cancelled = true;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, [characterId, handleSiblingEvent]);

  // 캐릭터 전환 시 메시지 초기화
  const clearSiblingMessages = useCallback(() => {
    setSiblingMessages([]);
  }, []);

  return {
    siblingMessages,
    clearSiblingMessages,
  };
}
