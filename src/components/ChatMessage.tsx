"use client";

import type { ChatMessage as ChatMessageType, CharacterId } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";
import ToolIndicator from "./ToolIndicator";

interface ChatMessageProps {
  message: ChatMessageType;
  characterId: CharacterId;
}

export default function ChatMessage({ message, characterId }: ChatMessageProps) {
  const isUser = message.role === "user";
  const char = CHARACTERS[characterId];

  return (
    <div className={`flex gap-2 px-3 py-1.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* 아바타 (assistant만) */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base mt-1">
          {char.emoji}
        </div>
      )}

      {/* 메시지 버블 */}
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* 이미지 첨부 표시 */}
        {isUser && message.imageUrl && (
          <div className="mb-1 flex justify-end">
            <span className="text-xs text-gray-400">📷 사진 첨부</span>
          </div>
        )}

        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : characterId === "naruen"
              ? "bg-pink-50 text-gray-800 rounded-bl-md border border-pink-100"
              : "bg-blue-50 text-gray-800 rounded-bl-md border border-blue-100"
          }`}
        >
          {message.content || (message.isStreaming ? "" : "...")}

          {/* 스트리밍 커서 */}
          {message.isStreaming && !message.toolUse && (
            <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-blink align-middle" />
          )}
        </div>

        {/* 도구 사용 표시 */}
        {message.toolUse && <ToolIndicator toolName={message.toolUse} />}

        {/* 감정 태그 */}
        {!isUser && message.emotion && !message.isStreaming && (
          <div className="mt-0.5 ml-1">
            <span className="text-[10px] text-gray-400">
              {message.emotion}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
