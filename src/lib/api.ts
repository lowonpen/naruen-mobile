import { getToken, clearToken } from "./auth";
import type { CharacterState, ConversationResponse, CharacterId } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearToken();
    throw new Error("UNAUTHORIZED");
  }

  return response;
}

// 캐릭터 상태 조회
export async function getStatus(characterId: CharacterId = "naruen"): Promise<CharacterState> {
  const res = await fetchWithAuth(`/api/status?character_id=${characterId}`);
  if (!res.ok) throw new Error(`Status error: ${res.status}`);
  return res.json();
}

// 대화 기록 조회
export async function getConversation(
  characterId: CharacterId = "naruen",
  limit: number = 20
): Promise<ConversationResponse> {
  const res = await fetchWithAuth(`/api/conversation?character_id=${characterId}&limit=${limit}`);
  if (!res.ok) throw new Error(`Conversation error: ${res.status}`);
  return res.json();
}

// 서버 상태 확인 (토큰 검증용)
export async function validateToken(): Promise<boolean> {
  try {
    await getStatus("naruen");
    return true;
  } catch {
    return false;
  }
}

// SSE 채팅 (fetch 기반 — POST + Auth 필요)
export function chatStream(
  message: string,
  characterId: CharacterId = "naruen"
): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  return fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, character_id: characterId }),
  });
}

// SSE 이미지 첨부 채팅
export function chatImageStream(
  message: string,
  imageBase64: string,
  characterId: CharacterId = "naruen"
): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  return fetch(`${API_URL}/api/chat/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      character_id: characterId,
      image_base64: imageBase64,
    }),
  });
}

export { API_URL };
