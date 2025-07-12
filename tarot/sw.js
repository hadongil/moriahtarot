// 캐시 이름 설정
const CACHE_NAME = 'moria-tarot-cache-v1';
// 캐시할 파일 목록
const urlsToCache = [
  '/tarot/', // 루트 URL
  '/tarot/index.html',
  '/tarot/icon-192.png',
  '/tarot/icon-512.png'
  // 여기에 CSS나 다른 JS 파일이 있다면 추가하세요.
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 요청 처리
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 파일이 있으면 그것을 반환하고, 없으면 네트워크에서 가져옴
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((networkResponse) => {
            // 네트워크 응답이 성공적이면 캐시에 저장
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            // 네트워크 요청이 실패하면 기본 페이지 반환
            console.error('Fetch failed:', error);
            if (event.request.destination === 'document') {
              return caches.match('/tarot/index.html');
            }
            return new Response('Network error', { status: 503 });
          });
      })
  );
});
