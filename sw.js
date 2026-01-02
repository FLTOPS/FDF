// sw.js
const CACHE_NAME = "fdf-cache-v1";
const urlsToCache = [
  "/",          // index.html
  "/index.html",
  "/styles.css",
  "/script.js",
  "/icon.png"   // 앱 아이콘
];

// 설치 단계: 캐시 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 요청 가로채기: 캐시 우선
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
