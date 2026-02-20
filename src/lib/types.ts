// ========== SSE 이벤트 타입 ==========

export interface SSEEventSpeak {
  type: "speak";
  content: string; // 누적 텍스트 (delta 아님, 매번 전체 교체)
}

export interface SSEEventToolUse {
  type: "tool_use";
  name: string; // "web_search" | "eat_food" | "remember_search"
  input: Record<string, unknown>;
}

export interface SSEEventToolResult {
  type: "tool_result";
  name: string;
  content: string; // 200자 제한
}

export interface SSEEventInnerState {
  type: "inner_state";
  data: InnerState;
}

export interface SSEEventState {
  type: "state";
  data: CharacterState;
}

export interface SSEEventDone {
  type: "done";
}

export interface SSEEventError {
  type: "error";
  message: string;
}

export type SSEEvent =
  | SSEEventSpeak
  | SSEEventToolUse
  | SSEEventToolResult
  | SSEEventInnerState
  | SSEEventState
  | SSEEventDone
  | SSEEventError;

// ========== 캐릭터 상태 ==========

export interface CharacterState {
  character: {
    id: string; // "naruen" | "narin"
    name: string; // "송나른" | "송나린"
    nickname: string; // "나른이" | "나린이"
  };
  hormone: {
    dopamine: number;
    serotonin: number;
    adrenaline: number;
    cortisol: number;
    oxytocin: number;
    melatonin: number;
  } | null;
  emotion: string | null; // "기쁨", "슬픔" 등
  sleep: {
    is_sleeping: boolean;
    drowsiness: number; // 0~3
  };
  activity: {
    current: string | null;
    location: string | null;
  };
  hunger: number; // satiety 0~100
  fitness: number; // 0~100
}

export interface InnerState {
  emotion?: string;
  emotions?: Array<{
    name: string;
    intensity: number; // 0.0~1.0
  }>;
  body?: string;
  energy?: string;
  thought?: string;
  [key: string]: unknown;
}

// ========== 채팅 메시지 ==========

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  emotion?: string;
  toolUse?: string; // 도구 사용 중 표시
  imageUrl?: string; // 사용자 이미지 첨부
}

// ========== API 응답 ==========

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string | null;
}

export interface ConversationResponse {
  conversation: ConversationMessage[];
}

// ========== 캐릭터 설정 ==========

export type CharacterId = "naruen" | "narin";

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  nickname: string;
  emoji: string;
  themeClass: string;
}

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  naruen: {
    id: "naruen",
    name: "송나른",
    nickname: "나른이",
    emoji: "🐰",
    themeClass: "theme-naruen",
  },
  narin: {
    id: "narin",
    name: "송나린",
    nickname: "나린이",
    emoji: "💎",
    themeClass: "theme-narin",
  },
};
