import type { SSEEvent } from "./types";

/**
 * fetch 기반 SSE 파서 (async generator)
 * EventSource 대신 사용 — POST + Authorization 헤더 지원
 */
export async function* parseSSEStream(response: Response): AsyncGenerator<SSEEvent> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is null");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE 이벤트는 빈 줄(\n\n)로 구분
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || ""; // 마지막 불완전한 부분은 버퍼에 유지

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        const event = parseSSEEvent(trimmed);
        if (event) {
          yield event;
        }
      }
    }

    // 남은 버퍼 처리
    if (buffer.trim()) {
      const event = parseSSEEvent(buffer.trim());
      if (event) {
        yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSSEEvent(raw: string): SSEEvent | null {
  let data = "";

  for (const line of raw.split("\n")) {
    if (line.startsWith("data: ")) {
      data = line.slice(6);
    }
    // event: 타입은 data의 type 필드에 이미 포함됨
  }

  if (!data) return null;

  try {
    return JSON.parse(data) as SSEEvent;
  } catch {
    console.warn("[SSE] JSON 파싱 실패:", data);
    return null;
  }
}
