"use client";

import type { CharacterState, CharacterId } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";

interface StatusBarProps {
  characterId: CharacterId;
  status: CharacterState | null;
  currentEmotion: string | null;
}

// 감정 → 이모지 매핑
const EMOTION_EMOJI: Record<string, string> = {
  "기쁨": "😊",
  "행복": "😄",
  "슬픔": "😢",
  "분노": "😠",
  "놀람": "😲",
  "공포": "😨",
  "혐오": "🤢",
  "당황": "😳",
  "걱정": "😟",
  "평온": "😌",
  "설렘": "💕",
  "지루함": "😑",
  "피곤": "😴",
  "궁금": "🤔",
  "감동": "🥹",
  "짜증": "😤",
  "부끄러움": "🫣",
  "만족": "😊",
};

function getEmotionEmoji(emotion: string | null | undefined): string {
  if (!emotion) return "😐";
  return EMOTION_EMOJI[emotion] || "😐";
}

function getHungerLabel(satiety: number): { emoji: string; label: string } {
  if (satiety >= 80) return { emoji: "🍽️", label: "배부름" };
  if (satiety >= 50) return { emoji: "🍽️", label: "적당" };
  if (satiety >= 30) return { emoji: "🍽️", label: "출출" };
  return { emoji: "😋", label: "배고픔" };
}

function getDrowsinessLabel(level: number): { emoji: string; label: string } {
  if (level >= 3) return { emoji: "😴", label: "졸림" };
  if (level >= 2) return { emoji: "🥱", label: "나른" };
  if (level >= 1) return { emoji: "😪", label: "약간" };
  return { emoji: "✨", label: "맑음" };
}

function getActivityLabel(activity: string | null | undefined): { emoji: string; label: string } | null {
  if (!activity) return null;
  const lower = activity.toLowerCase();
  if (lower.includes("eat") || lower.includes("식사")) return { emoji: "🍚", label: "식사 중" };
  if (lower.includes("exercis") || lower.includes("운동")) return { emoji: "🏃", label: "운동 중" };
  if (lower.includes("youtube") || lower.includes("유튜브")) return { emoji: "📺", label: "유튜브" };
  if (lower.includes("sleep") || lower.includes("nap")) return null; // 수면은 별도 표시
  return { emoji: "🎯", label: activity };
}

export default function StatusBar({ characterId, status, currentEmotion }: StatusBarProps) {
  const char = CHARACTERS[characterId];
  const emotion = currentEmotion || status?.emotion;
  const isSleeping = status?.sleep?.is_sleeping;

  return (
    <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
      characterId === "naruen" ? "bg-pink-50 border-pink-100" : "bg-blue-50 border-blue-100"
    }`}>
      {/* 왼쪽: 캐릭터 이름 */}
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{char.emoji}</span>
        <span className="font-semibold text-gray-800">{char.nickname}</span>
        {isSleeping && (
          <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
            수면 중 zzZ
          </span>
        )}
      </div>

      {/* 오른쪽: 상태 아이콘들 */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {/* 현재 활동 (식사 중, 운동 중 등) */}
        {status?.activity?.current && (() => {
          const act = getActivityLabel(status.activity.current);
          return act ? (
            <span className="flex items-center gap-0.5 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full animate-pulse" title={status.activity.current}>
              {act.emoji} {act.label}
            </span>
          ) : null;
        })()}

        {/* 감정 */}
        <span title={emotion || "평온"}>
          {getEmotionEmoji(emotion)}
        </span>

        {/* 배고픔 */}
        {status && (
          <span title={`포만감: ${status.hunger}`}>
            {getHungerLabel(status.hunger).emoji}
          </span>
        )}

        {/* 졸림 */}
        {status?.sleep && (
          <span title={`졸림: ${status.sleep.drowsiness}`}>
            {getDrowsinessLabel(status.sleep.drowsiness).emoji}
          </span>
        )}
      </div>
    </div>
  );
}
