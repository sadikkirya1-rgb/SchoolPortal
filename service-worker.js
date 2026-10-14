const SHELL_CACHE = 'school-portal-shell-v4';
const RUNTIME_CACHE = 'school-portal-runtime-v4';
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

self.addEventListener('push', event => {
    if (!event.data) return;
    let payload;
    try {
        payload = event.data.json();
    } catch (error) {
        console.warn('A push message could not be parsed.', error);
        return;
    }
    const notification = payload.notification || payload.data || {};
    if (!notification.title) return;
    let destination = BASE_URL.href;
    try {
        const requestedUrl = new URL(notification.url || BASE_URL.href, self.location.href);
        if (requestedUrl.origin === self.location.origin && requestedUrl.pathname.startsWith(BASE_URL.pathname)) {
            destination = requestedUrl.href;
        }
    } catch (error) {
        console.warn('A push notification contained an invalid destination.', error);
    }
    event.waitUntil(self.registration.showNotification(notification.title, {
        body: notification.body || '',
        icon: new URL('./school-portal-icon.svg', self.location.href).href,
        badge: new URL('./school-portal-icon.svg', self.location.href).href,
        data: { url: destination }
    }));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil((async () => {
        const requestedUrl = new URL(event.notification.data?.url || BASE_URL.href, self.location.href);
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clients) {
            if (client.url.startsWith(BASE_URL.href) && 'navigate' in client) {
                await client.navigate(requestedUrl.href);
                return client.focus();
            }
        }
        return self.clients.openWindow(requestedUrl.href);
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
