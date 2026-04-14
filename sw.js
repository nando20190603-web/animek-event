// ANIMEK Event App - Service Worker
// iOS Safariのキャッシュ問題を解決するため、HTMLは常にネットワークから取得する

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  // 古いキャッシュをすべて削除
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // HTMLページ（ナビゲーション）は常にネットワーク優先・キャッシュ無効
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => new Response(
          '<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>オフライン</h2><p>インターネット接続を確認してください</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        ))
    );
  }
  // その他のリソースはデフォルト動作（キャッシュ利用可）
});
