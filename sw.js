// sw.js
const CACHE_NAME = "fdf-cache-v1";
const urlsToCache = [
  "/",          // index.html
  "/index.html",
  "/styles.css",
  "/script.js",
  "/icon.png",   // 앱 아이콘
  "/offline.html" // 오프라인 안내 페이지 (선택)
];

// 설치 단계: 캐시 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("캐시 저장 완료");
      return cache.addAll(urlsToCache);
    })
  );
});

// 활성화 단계: 오래된 캐시 정리
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log("오래된 캐시 삭제:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// 요청 가로채기: 캐시 우선 + 네트워크 응답 캐싱
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 캐시에 있으면 반환
      if (response) {
        return response;
      }

      // 없으면 네트워크 요청 후 캐시에 저장
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // 완전히 오프라인일 때 offline.html 제공
        if (event.request.destination === "document") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});