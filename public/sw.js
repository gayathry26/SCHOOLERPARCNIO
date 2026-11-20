// EdvoNest PWA Service Worker — Mobile-First School ERP
// Tagline: Learn • Grow • Succeed

const CACHE_NAME = 'edvonest-static-v2';
const OFFLINE_URL = '/offline.html';

// Static App Assets to Pre-cache
const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable.svg',
  '/icons/apple-touch-icon.svg',
];

// Sensitive API and Resource Blacklist — NEVER CACHED IN BROWSER STORAGE
const SENSITIVE_PATTERNS = [
  '/api/fees',
  '/api/finance',
  '/api/health',
  '/api/auth',
  '/api/admissions',
  '/api/audit-logs',
  '/api/saas',
  '/api/students',
];

// 1. Install Event — Pre-cache static shell & offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets & offline shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event — Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event — Network-first for pages, Stale-while-revalidate for static assets, Explicit bypass for sensitive data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP/HTTPS requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // SECURITY ENFORCEMENT: Never cache sensitive API routes or authentication requests
  const isSensitive = SENSITIVE_PATTERNS.some((pattern) => url.pathname.startsWith(pattern));
  if (isSensitive) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'You are currently offline. Sensitive records are protected and cannot be accessed without network.',
            isOffline: true,
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // Navigation Requests (HTML Pages) -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        // Return friendly branded offline fallback
        return cache.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Static Assets (Images, Icons, CSS, JS chunks) -> Stale While Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default Network-First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 4. Push Notification Event Handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  let data = {
    title: 'EdvoNest Notification',
    body: 'You have a new update in your school portal.',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    url: '/dashboard',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.svg',
    badge: data.badge || '/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open EdvoNest' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 5. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Or open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Background Synchronization
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered with tag:', event.tag);
  if (event.tag === 'sync-attendance' || event.tag === 'sync-offline-actions') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC', tag: event.tag });
        });
      })
    );
  }
});
