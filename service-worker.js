const SHELL_CACHE = 'school-portal-shell-v3';
const RUNTIME_CACHE = 'school-portal-runtime-v3';
const BASE_URL = new URL('./', self.location.href);

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL_CACHE);
        const indexUrl = new URL('./index.html', self.location.href);
        const response = await fetch(indexUrl, { cache: 'reload' });
        if (!response.ok) throw new Error('Unable to cache the application shell.');
        await cache.put(indexUrl, response.clone());

        const html = await response.text();
        const references = [...html.matchAll(/(?:src|href)=['"]([^'"]+)['"]/gi)].map(match => match[1]);
        const assets = new Set([BASE_URL.href, indexUrl.href]);

        references.forEach(reference => {
            try {
                const url = new URL(reference, indexUrl);
                if (url.origin === self.location.origin && url.protocol === 'https:') {
                    assets.add(url.href);
                }
            } catch {}
        });

        await Promise.allSettled([...assets].filter(url => url !== indexUrl.href).map(async url => {
            const asset = await fetch(url, { cache: 'reload' });
            if (asset.ok) await cache.put(url, asset.clone());
        }));

        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
        await Promise.all(cacheNames
            .filter(name => name.startsWith('school-portal-') && !keep.has(name))
            .map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const localAsset = url.origin === self.location.origin;
    const firebaseModule = url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/');
    if (!localAsset && !firebaseModule) return;

    event.respondWith((async () => {
        const cache = await caches.open(localAsset ? SHELL_CACHE : RUNTIME_CACHE);
        const cached = await cache.match(request);

        if (request.mode === 'navigate') {
            try {
                const networkResponse = await fetch(request, { cache: 'no-cache' });
                if (networkResponse && networkResponse.ok) {
                    await cache.put(request, networkResponse.clone());
                    return networkResponse;
                }
            } catch (error) {
                const fallback = await cache.match(new URL('./index.html', self.location.href));
                if (fallback) return fallback;
            }
            return cached || (await cache.match(new URL('./index.html', self.location.href)));
        }

        try {
            const response = await fetch(request, { cache: 'no-cache' });
            if (response && response.ok) {
                await cache.put(request, response.clone());
                return response;
            }
        } catch (error) {
            if (cached) return cached;
            throw error;
        }

        return cached || Response.error();
    })());
});
