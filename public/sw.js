let cache;
self.addEventListener('install', async function () {
  // Perform install steps
  cache = await caches.open('faded-v1');
});

self.addEventListener('fetch', async function (event) {
  event.respondWith(getCache(event));
});
async function getCache(event) {
  const pathname = '/' + event.request.url.split('/').slice(3).join('/');
  let res;
  if (pathname.startsWith(`/assets`)) {
    const cacheFile = await caches.match(event.request);
    if (cacheFile) {
      return cacheFile;
    } else {
      try {
        const response = await fetch(event.request);
        if (response.clone) {
          await cache.put(event.request, response.clone());
        } else {
          await cache.put(event.request, response);
        }
        res = response;
      } catch (e) {
        console.error(e);
      }
    }
  } else {
    try {
      res = await fetch(event.request);
    } catch (e) {
      console.error(e);
    }
  }
  return res;
}
