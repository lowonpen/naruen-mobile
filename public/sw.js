// 송나른 Service Worker — 정적 에셋 캐싱 (API 제외)
const CACHE_NAME = "naruen-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // API 호출과 SSE 스트림은 캐싱하지 않음
  if (request.url.includes("/api/")) return;

  // POST 요청은 캐싱하지 않음
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // 성공적인 응답만 캐싱
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      });
    }).catch(() => {
      // 오프라인 폴백
      if (request.destination === "document") {
        return caches.match("/chat") || caches.match("/");
      }
      return new Response("Offline", { status: 503 });
    })
  );
});
