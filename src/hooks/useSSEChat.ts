"use client";

import { useState, useCallback, useRef } from "react";
import { chatStream, chatImageStream, getConversation } from "@/lib/api";
import { parseSSEStream } from "@/lib/sse";
import type {
  ChatMessage,
  CharacterId,
  CharacterState,
  SSEEvent,
} from "@/lib/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useSSEChat(characterId: CharacterId) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [characterState, setCharacterState] = useState<CharacterState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 대화 기록 로드
  const loadHistory = useCallback(async () => {
    try {
      const data = await getConversation(characterId, 20);
      const loaded: ChatMessage[] = data.conversation.map((msg, i) => ({
        id: `history-${i}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }));
      setMessages(loaded);
    } catch (err) {
      console.warn("[Chat] 대화 기록 로드 실패:", err);
    }
  }, [characterId]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (text: string, imageBase64?: string) => {
      if (isStreaming) return;
      setError(null);

      // 1. 사용자 메시지 추가
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: new Date(),
        imageUrl: imageBase64 ? "attached" : undefined,
      };

      // 2. 어시스턴트 플레이스홀더 추가
      const assistantId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        // 3. SSE 스트림 시작
        const response = imageBase64
          ? await chatImageStream(text, imageBase64, characterId)
          : await chatStream(text, characterId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        // 4. SSE 이벤트 처리
        for await (const event of parseSSEStream(response)) {
          handleSSEEvent(event, assistantId);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "알 수 없는 오류";
        setError(msg);

        // 실패한 어시스턴트 메시지 업데이트
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `오류가 발생했어요: ${msg}`, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [characterId, isStreaming]
  );

  // SSE 이벤트 핸들러
  const handleSSEEvent = useCallback(
    (event: SSEEvent, assistantId: string) => {
      switch (event.type) {
        case "speak":
          // 누적 텍스트 교체 (delta 아님!)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: event.content } : m
            )
          );
          break;

        case "tool_use":
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, toolUse: event.name } : m
            )
          );
          break;

        case "tool_result":
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, toolUse: undefined } : m
            )
          );
          break;

        case "inner_state":
          if (event.data?.emotion) {
            setCurrentEmotion(event.data.emotion);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, emotion: event.data.emotion }
                  : m
              )
            );
          }
          break;

        case "state":
          setCharacterState(event.data);
          break;

        case "done":
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, isStreaming: false, toolUse: undefined }
                : m
            )
          );
          break;

        case "error":
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: event.message || "오류가 발생했어요",
                    isStreaming: false,
                  }
                : m
            )
          );
          setError(event.message);
          break;
      }
    },
    []
  );

  // 대화 초기화 (캐릭터 전환 시)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentEmotion(null);
    setCharacterState(null);
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    currentEmotion,
    characterState,
    error,
    sendMessage,
    loadHistory,
    clearMessages,
  };
}
