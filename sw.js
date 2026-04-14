// ANIMEK Event App - Service Worker v3
// ネットワーク優先戦略：HTMLは常にサーバーから取得し古いキャッシュを防ぐ

const SW_VERSION = 'animek-sw-v3';

// インストール：即座にアクティブ化（待機しない）
self.addEventListener('install', () => self.skipWaiting());

// アクティブ化：古いキャッシュを全削除 → 全クライアントを制御下に置く → リロード通知
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => clients.forEach(client => {
        client.postMessage({ type: 'SW_ACTIVATED', version: SW_VERSION });
      }))
  );
});

// フェッチ：HTMLナビゲーションは常にネットワークから取得（キャッシュ禁止）
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="5;url=."></head><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>⚠️ オフライン</h2><p>インターネット接続を確認してください</p><p style="font-size:12px;color:#888">5秒後に再試行します</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        ))
    );
  }
});
