const CACHE_NAME = 'marta-rail-offline-v1';
const CACHE_FILES = [
  'index.html',
  //'/js/app.js',
  '/js/lib/angular.js',
  '/css/style.css'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
