/* Classerize service worker — lightweight offline support.
 *
 * Strategy:
 *   - Navigations (HTML): network-first, fall back to cache, then offline.html.
 *   - Same-origin static GETs: stale-while-revalidate.
 *   - API calls, cross-origin, non-GET, and Next.js HMR: passed straight to the
 *     network (never cached) so live data and dev hot-reload keep working.
 */

const CACHE = "classerize-v1";
const PRECACHE = ["/offline.html", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

const bypass = (url) =>
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/_next/webpack-hmr") ||
    url.pathname.includes("hot-update") ||
    url.pathname.startsWith("/__next");

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin GETs we care about; everything else goes to network.
    if (request.method !== "GET" || url.origin !== self.location.origin || bypass(url)) {
        return;
    }

    // HTML navigations → network-first with offline fallback.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
                    return res;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline.html")))
        );
        return;
    }

    // Static assets → stale-while-revalidate.
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((res) => {
                    if (res && res.status === 200) {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
