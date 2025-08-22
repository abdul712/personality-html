/**
 * PersonalitySpark Service Worker v2
 * Enhanced caching, offline functionality, and performance optimization
 */

const CACHE_NAME = 'personality-spark-v2';
const STATIC_CACHE = 'personality-spark-static-v2';
const DYNAMIC_CACHE = 'personality-spark-dynamic-v2';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/404.html',
    '/50x.html',
    '/css/main.css',
    '/js/app.js',
    '/js/components/navigation.js',
    '/js/components/quiz.js',
    '/js/components/results.js',
    '/js/components/share.js',
    '/js/services/api.js',
    '/js/services/analytics.js',
    '/js/utils/helpers.js',
    '/js/utils/storage.js',
    '/manifest.json',
    '/assets/icons/icon-192.png',
    '/assets/icons/favicon.svg',
    '/robots.txt',
    '/sitemap.xml'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker v2');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached successfully');
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker v2');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Clean up expired dynamic cache entries
            cleanExpiredCache()
        ])
        .then(() => {
            console.log('[SW] Service Worker activated');
            self.clients.claim();
        })
    );
});

// Clean expired cache entries
async function cleanExpiredCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const cachedTime = response.headers.get('sw-cache-time');
                if (cachedTime && Date.now() - parseInt(cachedTime) > CACHE_EXPIRY) {
                    await cache.delete(request);
                    console.log('[SW] Expired cache entry deleted:', request.url);
                }
            }
        }
    } catch (error) {
        console.error('[SW] Error cleaning expired cache:', error);
    }
}

// Add timestamp to cached responses
function addCacheTimestamp(response) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('sw-cache-time', Date.now().toString());
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle navigation requests (SPA routing)
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }
    
    // Handle static file requests
    if (STATIC_FILES.includes(url.pathname)) {
        event.respondWith(handleStaticRequest(request));
        return;
    }
    
    // Handle dynamic requests (API calls, etc.)
    event.respondWith(handleDynamicRequest(request));
});

// Handle navigation requests
async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            return networkResponse;
        }
    } catch (error) {
        console.log('[SW] Network failed for navigation, trying cache');
    }
    
    // Fallback to cached index.html
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Last resort - return offline page
    return caches.match('/404.html') || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Handle static file requests
async function handleStaticRequest(request) {
    // Cache first strategy for static files
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Update cache in background if older than 1 hour
        const cachedTime = cachedResponse.headers.get('sw-cache-time');
        if (!cachedTime || Date.now() - parseInt(cachedTime) > 3600000) {
            fetch(request).then(async (networkResponse) => {
                if (networkResponse.ok) {
                    const cache = await caches.open(STATIC_CACHE);
                    cache.put(request, addCacheTimestamp(networkResponse.clone()));
                }
            }).catch(() => {
                // Ignore network errors in background update
            });
        }
        return cachedResponse;
    }
    
    // If not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, addCacheTimestamp(networkResponse.clone()));
            return networkResponse;
        }
    } catch (error) {
        console.log('[SW] Network failed for static resource:', request.url);
    }
    
    // Return offline fallback
    return new Response('Resource unavailable offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Handle dynamic requests
async function handleDynamicRequest(request) {
    try {
        // Network first for dynamic content
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, addCacheTimestamp(networkResponse.clone()));
            return networkResponse;
        }
    } catch (error) {
        console.log('[SW] Network failed for dynamic request:', request.url);
    }
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return error response
    return new Response('Request failed', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    try {
        // Send any queued analytics events
        const clients = await self.clients.matchAll();
        for (const client of clients) {
            client.postMessage({
                type: 'SYNC_ANALYTICS'
            });
        }
        console.log('[SW] Background analytics sync completed');
    } catch (error) {
        console.error('[SW] Analytics sync failed:', error);
    }
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/icons/icon-192.png',
            badge: '/assets/icons/favicon.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Take Quiz',
                    icon: '/assets/icons/icon-192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/assets/icons/icon-192.png'
                }
            ],
            requireInteraction: true
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/#quizzes')
        );
    } else if (!event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'CLAIM_CLIENTS':
                self.clients.claim();
                break;
            case 'CLEAR_CACHE':
                clearAllCaches();
                break;
        }
    }
});

// Clear all caches (for debugging)
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[SW] All caches cleared');
    } catch (error) {
        console.error('[SW] Error clearing caches:', error);
    }
}

// Periodic cache cleanup
setInterval(cleanExpiredCache, 60 * 60 * 1000); // Run every hour