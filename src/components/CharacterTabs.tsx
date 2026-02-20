"use client";

import type { CharacterId } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";

interface CharacterTabsProps {
  activeId: CharacterId;
  onChange: (id: CharacterId) => void;
}

export default function CharacterTabs({ activeId, onChange }: CharacterTabsProps) {
  const tabs: CharacterId[] = ["naruen", "narin"];

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((id) => {
        const char = CHARACTERS[id];
        const isActive = id === activeId;

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
              isActive
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="mr-1">{char.emoji}</span>
            {char.nickname}
            {isActive && (
              <div
                className={`absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full ${
                  id === "naruen" ? "bg-pink-400" : "bg-blue-400"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
