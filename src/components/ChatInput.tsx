"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useCamera } from "@/hooks/useCamera";
import ImagePreview from "./ImagePreview";

interface ChatInputProps {
  onSend: (message: string, imageBase64?: string) => void;
  disabled?: boolean;
  isSleeping?: boolean;
}

export default function ChatInput({ onSend, disabled, isSleeping }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { imagePreview, imageBase64, openCamera, handleFileChange, clearImage, fileInputRef } =
    useCamera();

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !imageBase64) return;

    onSend(trimmed || "이거 봐봐!", imageBase64 || undefined);
    setText("");
    clearImage();

    // 포커스 유지
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [text, imageBase64, onSend, clearImage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // 수면 중이면 비활성
  if (isSleeping) {
    return (
      <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 text-center text-sm text-indigo-400">
        💤 지금 자고 있어요... zzZ
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white safe-area-bottom">
      {/* 이미지 미리보기 */}
      {imagePreview && (
        <div className="pt-2">
          <ImagePreview src={imagePreview} onRemove={clearImage} />
        </div>
      )}

      {/* 입력 바 */}
      <div className="flex items-end gap-2 px-3 py-2">
        {/* 카메라 버튼 */}
        <button
          onClick={openCamera}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
          aria-label="사진 촬영"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* 숨겨진 파일 input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 텍스트 입력 */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-2xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:border-pink-300 disabled:opacity-50 max-h-24 overflow-y-auto"
          style={{ minHeight: "38px" }}
        />

        {/* 전송 버튼 */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !imageBase64)}
          className="flex-shrink-0 p-2 text-pink-400 hover:text-pink-600 disabled:opacity-30 transition-colors"
          aria-label="전송"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
