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
        // Cache opened successfully
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
        // Optionally skip waiting for failed cache installation
        return Promise.resolve();
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
        
        // 네트워크 요청 시도
        return fetch(event.request)
          .then((networkResponse) => {
            // 유효한 응답인지 확인
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 응답을 복제하여 캐시에 저장
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('Cache put failed:', error);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('Network fetch failed:', error);
            // 오프라인 상태에서 기본 응답 반환 가능
            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
      .catch((error) => {
        console.error('Cache match failed:', error);
        return fetch(event.request);
      })
  );
});
