/**
 * PersonalitySpark - Analytics Service
 * Handles user analytics and tracking with privacy-first approach
 */

class AnalyticsService {
    constructor() {
        this.isEnabled = false;
        this.hasConsent = false;
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.queue = [];
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    /**
     * Initialize analytics service
     */
    init() {
        // Check user consent
        this.checkConsent();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start batch processing
        if (this.hasConsent) {
            this.startBatchProcessing();
        }
        
        // Track page load
        this.trackPageView();
        
        console.log('📊 Analytics service initialized');
    }

    /**
     * Check if user has given analytics consent
     */
    checkConsent() {
        const preferences = window.PSStorage?.getUserPreferences();
        this.hasConsent = preferences?.analyticsOptIn !== false; // Default to true
        this.isEnabled = this.hasConsent && !this.isBot();
        
        if (!this.hasConsent) {
            console.log('📊 Analytics disabled - no user consent');
        }
    }

    /**
     * Check if current user agent is a bot
     */
    isBot() {
        const botPatterns = [
            /bot/i, /spider/i, /crawler/i, /fetcher/i,
            /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i
        ];
        
        return botPatterns.some(pattern => pattern.test(navigator.userAgent));
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get or create user ID (anonymous)
     */
    getUserId() {
        let userId = window.PSStorage?.getItem('analytics-user-id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            window.PSStorage?.setItem('analytics-user-id', userId);
        }
        return userId;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Track online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackEvent('page_hidden');
                this.flushQueue(); // Ensure data is sent before page potentially closes
            } else {
                this.trackEvent('page_visible');
            }
        });

        // Track beforeunload for session end
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end');
            this.flushQueueSync(); // Synchronous flush on page unload
        });

        // Track errors
        window.addEventListener('error', (event) => {
            this.trackError(event.error);
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(event.reason);
        });
    }

    /**
     * Start batch processing timer
     */
    startBatchProcessing() {
        setInterval(() => {
            if (this.queue.length > 0) {
                this.flushQueue();
            }
        }, this.flushInterval);
    }

    /**
     * Track an analytics event
     */
    trackEvent(eventName, eventData = {}, options = {}) {
        if (!this.isEnabled) {
            return;
        }

        const event = {
            eventName: eventName,
            eventData: this.sanitizeData(eventData),
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            ...options
        };

        // Add to queue
        this.queue.push(event);

        // Flush if queue is full or if this is a critical event
        if (this.queue.length >= this.batchSize || options.immediate) {
            this.flushQueue();
        }

        console.log('📊 Event tracked:', eventName, eventData);
    }

    /**
     * Track page view
     */
    trackPageView(pageData = {}) {
        const data = {
            title: document.title,
            ...pageData
        };

        this.trackEvent('page_view', data);
    }

    /**
     * Track quiz-specific events
     */
    trackQuizStart(quizType, quizId) {
        this.trackEvent('quiz_start', {
            quizType: quizType,
            quizId: quizId
        });
    }

    trackQuizQuestion(quizType, questionId, questionNumber, totalQuestions) {
        this.trackEvent('quiz_question', {
            quizType: quizType,
            questionId: questionId,
            questionNumber: questionNumber,
            totalQuestions: totalQuestions,
            progress: Math.round((questionNumber / totalQuestions) * 100)
        });
    }

    trackQuizComplete(quizType, quizId, completionTime, answers) {
        this.trackEvent('quiz_complete', {
            quizType: quizType,
            quizId: quizId,
            completionTime: completionTime,
            answerCount: answers ? answers.length : 0
        }, { immediate: true }); // Flush immediately for completion events
    }

    trackQuizAbandon(quizType, quizId, questionNumber, totalQuestions) {
        this.trackEvent('quiz_abandon', {
            quizType: quizType,
            quizId: quizId,
            questionNumber: questionNumber,
            totalQuestions: totalQuestions,
            progress: Math.round((questionNumber / totalQuestions) * 100)
        });
    }

    trackResultShare(shareMethod, quizType) {
        this.trackEvent('result_share', {
            shareMethod: shareMethod,
            quizType: quizType
        });
    }

    trackResultDownload(quizType) {
        this.trackEvent('result_download', {
            quizType: quizType
        });
    }

    /**
     * Track user interactions
     */
    trackButtonClick(buttonName, location) {
        this.trackEvent('button_click', {
            buttonName: buttonName,
            location: location
        });
    }

    trackNavigation(fromPage, toPage) {
        this.trackEvent('navigation', {
            fromPage: fromPage,
            toPage: toPage
        });
    }

    trackSearch(searchTerm, resultsCount) {
        this.trackEvent('search', {
            searchTerm: this.hashSensitiveData(searchTerm),
            resultsCount: resultsCount
        });
    }

    trackFormSubmit(formName, success = true) {
        this.trackEvent('form_submit', {
            formName: formName,
            success: success
        });
    }

    /**
     * Track performance metrics
     */
    trackPerformance(metric, value, context = {}) {
        this.trackEvent('performance', {
            metric: metric,
            value: value,
            context: context
        });
    }

    trackLoadTime(loadTime) {
        this.trackPerformance('page_load_time', loadTime);
    }

    trackQuizLoadTime(quizType, loadTime) {
        this.trackPerformance('quiz_load_time', loadTime, { quizType });
    }

    /**
     * Track errors
     */
    trackError(error, context = {}) {
        if (!this.isEnabled) {
            return;
        }

        const errorData = {
            message: error.message || error.toString(),
            stack: error.stack,
            url: window.location.href,
            lineNumber: error.lineno,
            columnNumber: error.colno,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            context: context
        };

        this.trackEvent('error', errorData, { immediate: true });
    }

    /**
     * Track custom conversion events
     */
    trackConversion(conversionType, value = 1, metadata = {}) {
        this.trackEvent('conversion', {
            conversionType: conversionType,
            value: value,
            metadata: metadata
        }, { immediate: true });
    }

    /**
     * Sanitize data to remove sensitive information
     */
    sanitizeData(data) {
        const sanitized = { ...data };
        const sensitiveKeys = ['password', 'email', 'phone', 'ssn', 'credit_card'];
        
        const recursiveSanitize = (obj) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                        obj[key] = '[REDACTED]';
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        recursiveSanitize(obj[key]);
                    }
                }
            }
        };

        recursiveSanitize(sanitized);
        return sanitized;
    }

    /**
     * Hash sensitive data for privacy
     */
    hashSensitiveData(data) {
        if (typeof data !== 'string' || data.length === 0) {
            return data;
        }

        // Simple hash function for client-side privacy
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }

    /**
     * Flush events queue
     */
    async flushQueue() {
        if (this.queue.length === 0 || !this.isOnline) {
            return;
        }

        const events = [...this.queue];
        this.queue = [];

        try {
            // Send to API
            if (window.PSAPI) {
                await window.PSAPI.request('/analytics/batch', {
                    method: 'POST',
                    body: JSON.stringify({ events })
                });
            }

            // Also send to Google Analytics if available
            this.sendToGoogleAnalytics(events);

            console.log(`📊 Flushed ${events.length} analytics events`);

        } catch (error) {
            console.warn('📊 Failed to send analytics events:', error);
            
            // Store failed events for retry
            if (window.PSStorage) {
                events.forEach(event => {
                    window.PSStorage.saveAnalyticsEvent(event);
                });
            }
        }
    }

    /**
     * Synchronous flush for page unload
     */
    flushQueueSync() {
        if (this.queue.length === 0) {
            return;
        }

        const events = [...this.queue];
        this.queue = [];

        // Use sendBeacon for reliable delivery on page unload
        if (navigator.sendBeacon) {
            const data = JSON.stringify({ events });
            navigator.sendBeacon('/analytics/batch', data);
        }
    }

    /**
     * Send events to Google Analytics (if configured)
     */
    sendToGoogleAnalytics(events) {
        if (typeof gtag === 'function') {
            events.forEach(event => {
                gtag('event', event.eventName, {
                    event_category: this.getEventCategory(event.eventName),
                    event_label: event.eventData?.label,
                    value: event.eventData?.value,
                    custom_map: {
                        session_id: event.sessionId,
                        quiz_type: event.eventData?.quizType
                    }
                });
            });
        }
    }

    /**
     * Get event category for Google Analytics
     */
    getEventCategory(eventName) {
        const categoryMap = {
            quiz_start: 'Quiz',
            quiz_complete: 'Quiz',
            quiz_abandon: 'Quiz',
            quiz_question: 'Quiz',
            result_share: 'Engagement',
            result_download: 'Engagement',
            button_click: 'UI',
            navigation: 'Navigation',
            search: 'Search',
            form_submit: 'Form',
            error: 'Error',
            performance: 'Performance',
            conversion: 'Conversion'
        };

        return categoryMap[eventName] || 'General';
    }

    /**
     * Enable/disable analytics
     */
    setEnabled(enabled) {
        this.isEnabled = enabled && this.hasConsent;
        
        if (window.PSStorage) {
            const preferences = window.PSStorage.getUserPreferences();
            preferences.analyticsOptIn = enabled;
            window.PSStorage.saveUserPreferences(preferences);
        }

        if (this.isEnabled) {
            this.startBatchProcessing();
            this.trackEvent('analytics_enabled');
        } else {
            this.trackEvent('analytics_disabled');
            this.flushQueue();
        }
    }

    /**
     * Get analytics summary
     */
    getAnalyticsSummary() {
        return {
            isEnabled: this.isEnabled,
            hasConsent: this.hasConsent,
            sessionId: this.sessionId,
            userId: this.userId,
            queueSize: this.queue.length,
            isOnline: this.isOnline
        };
    }

    /**
     * Export analytics data for user
     */
    exportUserData() {
        const storedEvents = window.PSStorage?.getAnalyticsEvents() || [];
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            currentQueue: this.queue,
            storedEvents: storedEvents.map(event => ({
                ...event,
                // Remove sensitive data from export
                userId: '[PRIVATE]',
                userAgent: '[PRIVATE]'
            }))
        };
    }

    /**
     * Clear all analytics data
     */
    clearAllData() {
        this.queue = [];
        window.PSStorage?.setItem('analytics-events', []);
        window.PSStorage?.removeItem('analytics-user-id');
        this.userId = this.getUserId(); // Generate new ID
        
        console.log('📊 Analytics data cleared');
    }
}

// Create global instance
const analytics = new AnalyticsService();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSAnalytics = analytics;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsService;
}