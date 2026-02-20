"use client";

interface ToolIndicatorProps {
  toolName: string;
}

const TOOL_LABELS: Record<string, { emoji: string; label: string }> = {
  web_search: { emoji: "🔍", label: "검색 중..." },
  remember_search: { emoji: "🧠", label: "기억을 떠올리는 중..." },
  eat_food: { emoji: "🍚", label: "먹는 중..." },
};

export default function ToolIndicator({ toolName }: ToolIndicatorProps) {
  const tool = TOOL_LABELS[toolName] || { emoji: "⚙️", label: "처리 중..." };

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 animate-pulse">
      <span>{tool.emoji}</span>
      <span>{tool.label}</span>
    </div>
  );
}
