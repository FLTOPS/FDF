const CACHE_NAME = 'site-cache-v1';
const FILES_TO_CACHE = [
  '/',              // 루트
  '/index.html',    // 메인 HTML
  '/styles.css',    // CSS
  '/app.js',        // JS
  '/manifest.json'  // PWA manifest
];

// 설치 단계: 초기 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// fetch 단계: stale-while-revalidate
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // 네트워크 응답이 성공적이면 캐시 갱신
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // 캐시가 있으면 먼저 반환, 없으면 네트워크 응답 반환
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// 활성화 단계: 오래된 캐시 정리
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});