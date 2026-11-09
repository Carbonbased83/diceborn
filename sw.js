const CACHE = 'diceborn-v2';
const ASSETS = [
  './',
  './index.html',
  './game.css',
  './game.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/nunito-700.woff2',
  './fonts/nunito-800.woff2',
  './art/camp.jpg',
  './art/battle.jpg',
  './art/board.jpg',
  './art/fenn.png',
  './art/bramble.png',
  './art/luma.png',
  './art/cobble.png',
  './art/slime.png',
  './art/bat.png',
  './art/goblin.png',
  './art/knight.png',
  './art/dragon.png',
  './art/wagon.png',
  './art/chest.png',
  './art/tree.png',
  './art/tile-start.png',
  './art/tile-fight.png',
  './art/tile-elite.png',
  './art/tile-buff.png',
  './art/tile-hazard.png',
  './art/tile-shop.png',
  './art/tile-mini.png',
  './art/tile-boss.png',
  './art/die-1.png',
  './art/die-2.png',
  './art/die-3.png',
  './art/die-4.png',
  './art/die-5.png',
  './art/die-6.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
