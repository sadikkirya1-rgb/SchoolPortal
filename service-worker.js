const SHELL_CACHE = 'school-portal-shell-v2';
const RUNTIME_CACHE = 'school-portal-runtime-v2';
const BASE_URL = new URL('./', self.location.href);

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL_CACHE);
        const indexUrl = new URL('./index.html', self.location.href);
        const response = await fetch(indexUrl, { cache: 'reload' });
        if (!response.ok) throw new Error('Unable to cache the application shell.');
        await cache.put(indexUrl, response.clone());
        const html = await response.text();
        const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map(match => match[1]);
        const assets = new Set([BASE_URL.href, indexUrl.href]);
        references.forEach(reference => {
            try {
                const url = new URL(reference, indexUrl);
                if (url.origin === self.location.origin && url.protocol === 'https:') assets.add(url.href);
            } catch {}
        });
        await Promise.allSettled([...assets].filter(url => url !== indexUrl.href).map(async url => {
            const asset = await fetch(url, { cache: 'reload' });
            if (asset.ok) await cache.put(url, asset);
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names
            .filter(name => name.startsWith('school-portal-') && ![SHELL_CACHE, RUNTIME_CACHE].includes(name))
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
        if (request.mode !== 'navigate' && cached) return cached;
        try {
            const response = await fetch(request);
            if (response.ok && (localAsset || response.type === 'cors')) {
                await cache.put(request, response.clone());
            }
            return response;
        } catch (error) {
            if (cached) return cached;
            if (request.mode === 'navigate') {
                const shell = await cache.match(new URL('./index.html', self.location.href));
                if (shell) return shell;
            }
            throw error;
        }
    })());
});
