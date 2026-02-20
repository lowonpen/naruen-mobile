"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSSEChat } from "@/hooks/useSSEChat";
import { useCharacterStatus } from "@/hooks/useCharacterStatus";
import StatusBar from "@/components/StatusBar";
import CharacterTabs from "@/components/CharacterTabs";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import type { CharacterId } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [characterId, setCharacterId] = useState<CharacterId>("naruen");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const {
    messages,
    isStreaming,
    currentEmotion,
    characterState,
    error,
    sendMessage,
    loadHistory,
    clearMessages,
  } = useSSEChat(characterId);

  const { status, updateFromSSE } = useCharacterStatus(characterId);

  // 인증 체크
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // 대화 기록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  // SSE state 이벤트 → 상태바 업데이트
  useEffect(() => {
    if (characterState) {
      updateFromSSE(characterState);
    }
  }, [characterState, updateFromSSE]);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // 스크롤 위치 감지 (사용자가 위로 스크롤하면 자동스크롤 비활성)
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  }, []);

  // 캐릭터 전환
  const handleCharacterChange = useCallback(
    (newId: CharacterId) => {
      if (newId === characterId || isStreaming) return;
      setCharacterId(newId);
      clearMessages();
    },
    [characterId, isStreaming, clearMessages]
  );

  // 메시지 전송
  const handleSend = useCallback(
    (text: string, imageBase64?: string) => {
      setAutoScroll(true);
      sendMessage(text, imageBase64);
    },
    [sendMessage]
  );

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">로딩 중...</p>
      </div>
    );
  }

  const isSleeping = status?.sleep?.is_sleeping || characterState?.sleep?.is_sleeping;

  return (
    <div className="flex flex-col h-dvh">
      {/* 상단: 상태바 + 캐릭터 탭 */}
      <div className="safe-area-top">
        <StatusBar
          characterId={characterId}
          status={status}
          currentEmotion={currentEmotion}
        />
        <CharacterTabs activeId={characterId} onChange={handleCharacterChange} />
      </div>

      {/* 중앙: 채팅 메시지 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto hide-scrollbar py-2"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-6">
            <div className="text-4xl mb-3">
              {characterId === "naruen" ? "🐰" : "💎"}
            </div>
            <p className="text-sm text-gray-400">
              {characterId === "naruen"
                ? "나른이에게 말을 걸어보세요!"
                : "나린이에게 말을 걸어보세요!"}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                characterId={characterId}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />

        {/* 스크롤 하단 버튼 */}
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            className="fixed bottom-20 right-4 w-8 h-8 bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center text-xs"
            aria-label="최신 메시지로"
          >
            ↓
          </button>
        )}
      </div>

      {/* 하단: 입력 바 */}
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        isSleeping={isSleeping}
      />
    </div>
  );
}
