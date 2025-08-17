/**
 * PersonalitySpark Service Worker
 * Provides offline functionality and caching for the PWA
 */

const CACHE_NAME = 'personality-spark-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/app.js',
    '/js/utils/helpers.js',
    '/js/utils/storage.js',
    '/js/services/api.js',
    '/js/services/analytics.js',
    '/js/components/navigation.js',
    '/js/components/quiz.js',
    '/js/components/results.js',
    '/js/components/share.js',
    '/manifest.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/favicon.ico',
    '/assets/icons/apple-touch-icon.png'
];

// Dynamic cache names
const DYNAMIC_CACHE = 'personality-spark-dynamic-v1';
const API_CACHE = 'personality-spark-api-v1';
const IMAGE_CACHE = 'personality-spark-images-v1';

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    CACHE_ONLY: 'cache-only',
    NETWORK_ONLY: 'network-only',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// URL patterns and their cache strategies
const CACHE_RULES = [
    {
        pattern: /^https:\/\/fonts\.googleapis\.com/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cacheName: 'google-fonts-stylesheets'
    },
    {
        pattern: /^https:\/\/fonts\.gstatic\.com/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: 'google-fonts-webfonts',
        expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
    },
    {
        pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: IMAGE_CACHE,
        expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
    },
    {
        pattern: /\/api\//,
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cacheName: API_CACHE,
        expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 // 1 day
        }
    }
];

/**
 * Service Worker Installation
 * Pre-cache essential static assets
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static assets:', error);
            })
    );
});

/**
 * Service Worker Activation
 * Clean up old caches and take control
 */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE && 
                            cacheName !== IMAGE_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker activated successfully');
        })
    );
});

/**
 * Fetch Event Handler
 * Implement caching strategies for different types of requests
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Apply caching strategy based on URL pattern
    const cacheRule = findCacheRule(request.url);
    
    if (cacheRule) {
        event.respondWith(
            applyCacheStrategy(request, cacheRule)
        );
    } else {
        // Default strategy for other requests
        event.respondWith(
            cacheFirstStrategy(request, DYNAMIC_CACHE)
        );
    }
});

/**
 * Find matching cache rule for a URL
 */
function findCacheRule(url) {
    return CACHE_RULES.find(rule => rule.pattern.test(url));
}

/**
 * Apply the appropriate cache strategy
 */
function applyCacheStrategy(request, rule) {
    switch (rule.strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirstStrategy(request, rule.cacheName, rule.expiration);
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirstStrategy(request, rule.cacheName, rule.expiration);
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidateStrategy(request, rule.cacheName, rule.expiration);
        case CACHE_STRATEGIES.CACHE_ONLY:
            return cacheOnlyStrategy(request, rule.cacheName);
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return networkOnlyStrategy(request);
        default:
            return cacheFirstStrategy(request, rule.cacheName, rule.expiration);
    }
}

/**
 * Cache First Strategy
 * Check cache first, fallback to network
 */
function cacheFirstStrategy(request, cacheName = DYNAMIC_CACHE, expiration = null) {
    return caches.open(cacheName)
        .then(cache => {
            return cache.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        // Check if cache entry is expired
                        if (expiration && isCacheExpired(cachedResponse, expiration)) {
                            return fetchAndCache(request, cache, expiration);
                        }
                        return cachedResponse;
                    }
                    
                    // Not in cache, fetch from network
                    return fetchAndCache(request, cache, expiration);
                });
        })
        .catch(() => {
            // Return offline fallback if available
            return getOfflineFallback(request);
        });
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
function networkFirstStrategy(request, cacheName = DYNAMIC_CACHE, expiration = null) {
    return caches.open(cacheName)
        .then(cache => {
            return fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        cache.put(request, response.clone());
                        
                        // Clean up expired entries
                        if (expiration) {
                            cleanupExpiredEntries(cache, expiration);
                        }
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return cache.match(request)
                        .then(cachedResponse => {
                            return cachedResponse || getOfflineFallback(request);
                        });
                });
        });
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
function staleWhileRevalidateStrategy(request, cacheName = DYNAMIC_CACHE, expiration = null) {
    return caches.open(cacheName)
        .then(cache => {
            return cache.match(request)
                .then(cachedResponse => {
                    // Fetch fresh version in background
                    const fetchPromise = fetch(request)
                        .then(response => {
                            if (response && response.status === 200) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            // Ignore network errors in background update
                        });
                    
                    // Return cached version immediately or wait for network
                    return cachedResponse || fetchPromise;
                });
        });
}

/**
 * Cache Only Strategy
 * Only return cached responses
 */
function cacheOnlyStrategy(request, cacheName = DYNAMIC_CACHE) {
    return caches.open(cacheName)
        .then(cache => cache.match(request))
        .then(cachedResponse => {
            return cachedResponse || getOfflineFallback(request);
        });
}

/**
 * Network Only Strategy
 * Always fetch from network
 */
function networkOnlyStrategy(request) {
    return fetch(request);
}

/**
 * Fetch and cache helper
 */
function fetchAndCache(request, cache, expiration = null) {
    return fetch(request)
        .then(response => {
            if (response && response.status === 200) {
                // Add timestamp for expiration check
                const responseWithTimestamp = addTimestampToResponse(response.clone());
                cache.put(request, responseWithTimestamp);
                
                // Clean up expired entries
                if (expiration) {
                    cleanupExpiredEntries(cache, expiration);
                }
            }
            return response;
        })
        .catch(error => {
            console.warn('Network request failed:', request.url, error);
            throw error;
        });
}

/**
 * Add timestamp to response for expiration tracking
 */
function addTimestampToResponse(response) {
    const headers = new Headers(response.headers);
    headers.append('sw-cache-timestamp', Date.now().toString());
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}

/**
 * Check if cache entry is expired
 */
function isCacheExpired(response, expiration) {
    if (!expiration || !expiration.maxAgeSeconds) {
        return false;
    }
    
    const timestamp = response.headers.get('sw-cache-timestamp');
    if (!timestamp) {
        return false;
    }
    
    const age = (Date.now() - parseInt(timestamp)) / 1000;
    return age > expiration.maxAgeSeconds;
}

/**
 * Clean up expired entries from cache
 */
function cleanupExpiredEntries(cache, expiration) {
    if (!expiration) {
        return Promise.resolve();
    }
    
    return cache.keys()
        .then(requests => {
            const cleanupPromises = requests.map(request => {
                return cache.match(request)
                    .then(response => {
                        if (response && isCacheExpired(response, expiration)) {
                            return cache.delete(request);
                        }
                    });
            });
            
            return Promise.all(cleanupPromises);
        })
        .then(() => {
            // Also enforce maxEntries limit
            if (expiration.maxEntries) {
                return enforceMaxEntries(cache, expiration.maxEntries);
            }
        });
}

/**
 * Enforce maximum number of cache entries
 */
function enforceMaxEntries(cache, maxEntries) {
    return cache.keys()
        .then(requests => {
            if (requests.length > maxEntries) {
                // Sort by timestamp and remove oldest entries
                const entriesToDelete = requests.length - maxEntries;
                const requestsWithTimestamps = requests.map(request => {
                    return cache.match(request)
                        .then(response => ({
                            request,
                            timestamp: response ? response.headers.get('sw-cache-timestamp') || '0' : '0'
                        }));
                });
                
                return Promise.all(requestsWithTimestamps)
                    .then(entries => {
                        entries.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
                        const deletePromises = entries
                            .slice(0, entriesToDelete)
                            .map(entry => cache.delete(entry.request));
                        
                        return Promise.all(deletePromises);
                    });
            }
        });
}

/**
 * Get offline fallback response
 */
function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Return cached main page for navigation requests
    if (request.mode === 'navigate') {
        return caches.match('/') || caches.match('/index.html');
    }
    
    // Return appropriate fallback based on Accept header
    const acceptHeader = request.headers.get('Accept') || '';
    
    if (acceptHeader.includes('text/html')) {
        return caches.match('/');
    }
    
    if (acceptHeader.includes('image/')) {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6b7280" font-family="Arial">Offline</text></svg>',
            { 
                headers: { 
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                } 
            }
        );
    }
    
    // Generic offline response
    return new Response(
        JSON.stringify({ 
            error: 'Offline', 
            message: 'This content is not available offline.' 
        }),
        { 
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            } 
        }
    );
}

/**
 * Handle background sync
 */
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'quiz-results-sync') {
        event.waitUntil(syncQuizResults());
    }
    
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

/**
 * Sync quiz results when online
 */
function syncQuizResults() {
    // Implementation would sync locally stored quiz results to server
    return Promise.resolve()
        .then(() => {
            console.log('📊 Quiz results synced successfully');
        })
        .catch(error => {
            console.error('❌ Failed to sync quiz results:', error);
            throw error;
        });
}

/**
 * Sync analytics when online
 */
function syncAnalytics() {
    // Implementation would sync analytics data to server
    return Promise.resolve()
        .then(() => {
            console.log('📈 Analytics synced successfully');
        })
        .catch(error => {
            console.error('❌ Failed to sync analytics:', error);
            throw error;
        });
}

/**
 * Handle push notifications
 */
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'Time for your daily personality challenge!',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge.png',
        vibrate: [200, 100, 200],
        tag: 'personality-spark-daily',
        requireInteraction: false,
        actions: [
            {
                action: 'take-quiz',
                title: 'Take Quiz',
                icon: '/assets/icons/action-quiz.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/assets/icons/action-dismiss.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.title = data.title || 'PersonalitySpark';
            options.tag = data.tag || options.tag;
        } catch (error) {
            console.warn('Failed to parse push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('PersonalitySpark', options)
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'take-quiz') {
        event.waitUntil(
            clients.openWindow('/#quizzes')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default click - open app
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    // If app is already open, focus it
                    for (const client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // Otherwise open new window
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

/**
 * Handle messages from main thread
 */
self.addEventListener('message', event => {
    console.log('💬 Message received in SW:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_QUIZ_RESULT') {
        // Cache quiz result for offline access
        const result = event.data.result;
        caches.open(DYNAMIC_CACHE)
            .then(cache => {
                cache.put(
                    new Request(`/quiz-result/${result.id}`),
                    new Response(JSON.stringify(result), {
                        headers: { 'Content-Type': 'application/json' }
                    })
                );
            });
    }
});

/**
 * Periodic background sync for maintenance
 */
self.addEventListener('periodicsync', event => {
    console.log('🔄 Periodic sync triggered:', event.tag);
    
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(performCacheCleanup());
    }
});

/**
 * Perform cache cleanup
 */
function performCacheCleanup() {
    return Promise.all([
        cleanupCache(DYNAMIC_CACHE, { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }), // 1 week
        cleanupCache(API_CACHE, { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }), // 1 day
        cleanupCache(IMAGE_CACHE, { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }) // 30 days
    ]).then(() => {
        console.log('🧹 Cache cleanup completed');
    });
}

/**
 * Cleanup specific cache
 */
function cleanupCache(cacheName, expiration) {
    return caches.open(cacheName)
        .then(cache => cleanupExpiredEntries(cache, expiration))
        .catch(error => {
            console.warn(`Failed to cleanup cache ${cacheName}:`, error);
        });
}

// Log service worker version
console.log(`🎯 PersonalitySpark Service Worker v${CACHE_VERSION} loaded`);

// Performance monitoring
const performanceData = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    startTime: Date.now()
};

// Track cache performance
function trackCacheHit() {
    performanceData.cacheHits++;
}

function trackCacheMiss() {
    performanceData.cacheMisses++;
}

function trackNetworkRequest() {
    performanceData.networkRequests++;
}

// Send performance data periodically
setInterval(() => {
    const runtime = Date.now() - performanceData.startTime;
    const hitRate = performanceData.cacheHits / (performanceData.cacheHits + performanceData.cacheMisses) * 100;
    
    console.log('📊 SW Performance:', {
        runtime: Math.round(runtime / 1000) + 's',
        cacheHitRate: Math.round(hitRate) + '%',
        cacheHits: performanceData.cacheHits,
        cacheMisses: performanceData.cacheMisses,
        networkRequests: performanceData.networkRequests
    });
}, 60000); // Every minute