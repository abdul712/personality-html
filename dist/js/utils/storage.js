/**
 * PersonalitySpark - Storage Utility
 * Handles localStorage operations with error handling and data validation
 */

class StorageManager {
    constructor() {
        this.isSupported = this.checkSupport();
        this.prefix = 'personality-spark-';
        this.version = '1.0.0';
    }

    /**
     * Check if localStorage is supported
     */
    checkSupport() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not supported');
            return false;
        }
    }

    /**
     * Get prefixed key
     */
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Set item in localStorage
     */
    setItem(key, value, options = {}) {
        if (!this.isSupported) {
            console.warn('localStorage not supported, using memory storage');
            return this.setMemoryItem(key, value);
        }

        try {
            const prefixedKey = this.getKey(key);
            const data = {
                value: value,
                timestamp: Date.now(),
                version: this.version,
                expires: options.expires || null
            };

            localStorage.setItem(prefixedKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.cleanupExpiredItems();
                // Try again after cleanup
                try {
                    const prefixedKey = this.getKey(key);
                    const data = {
                        value: value,
                        timestamp: Date.now(),
                        version: this.version,
                        expires: options.expires || null
                    };
                    localStorage.setItem(prefixedKey, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save after cleanup:', retryError);
                    return false;
                }
            }
            return false;
        }
    }

    /**
     * Get item from localStorage
     */
    getItem(key, defaultValue = null) {
        if (!this.isSupported) {
            return this.getMemoryItem(key, defaultValue);
        }

        try {
            const prefixedKey = this.getKey(key);
            const stored = localStorage.getItem(prefixedKey);
            
            if (!stored) {
                return defaultValue;
            }

            const data = JSON.parse(stored);

            // Check if data has expired
            if (data.expires && Date.now() > data.expires) {
                this.removeItem(key);
                return defaultValue;
            }

            // Check version compatibility
            if (data.version && data.version !== this.version) {
                console.warn(`Version mismatch for ${key}, returning default value`);
                return defaultValue;
            }

            return data.value;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     */
    removeItem(key) {
        if (!this.isSupported) {
            return this.removeMemoryItem(key);
        }

        try {
            const prefixedKey = this.getKey(key);
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all app data from localStorage
     */
    clear() {
        if (!this.isSupported) {
            this.memoryStorage = {};
            return true;
        }

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }

    /**
     * Get all keys with app prefix
     */
    getAllKeys() {
        if (!this.isSupported) {
            return Object.keys(this.memoryStorage || {});
        }

        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Failed to get keys from localStorage:', error);
            return [];
        }
    }

    /**
     * Check if key exists
     */
    hasItem(key) {
        if (!this.isSupported) {
            return this.hasMemoryItem(key);
        }

        try {
            const prefixedKey = this.getKey(key);
            const stored = localStorage.getItem(prefixedKey);
            
            if (!stored) {
                return false;
            }

            const data = JSON.parse(stored);

            // Check if expired
            if (data.expires && Date.now() > data.expires) {
                this.removeItem(key);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to check localStorage item:', error);
            return false;
        }
    }

    /**
     * Get storage usage information
     */
    getStorageInfo() {
        if (!this.isSupported) {
            return {
                used: JSON.stringify(this.memoryStorage || {}).length,
                available: Infinity,
                total: Infinity
            };
        }

        try {
            let used = 0;
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    used += localStorage.getItem(key).length;
                }
            });

            // Estimate total localStorage size (usually 5-10MB)
            const total = 10 * 1024 * 1024; // 10MB estimate
            const available = total - used;

            return {
                used: used,
                available: available,
                total: total,
                usedFormatted: this.formatBytes(used),
                availableFormatted: this.formatBytes(available),
                totalFormatted: this.formatBytes(total),
                usagePercentage: Math.round((used / total) * 100)
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }

    /**
     * Cleanup expired items
     */
    cleanupExpiredItems() {
        if (!this.isSupported) {
            return;
        }

        try {
            const keys = Object.keys(localStorage);
            let cleanedCount = 0;

            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    try {
                        const stored = localStorage.getItem(key);
                        const data = JSON.parse(stored);

                        if (data.expires && Date.now() > data.expires) {
                            localStorage.removeItem(key);
                            cleanedCount++;
                        }
                    } catch (error) {
                        // Remove corrupted entries
                        localStorage.removeItem(key);
                        cleanedCount++;
                    }
                }
            });

            if (cleanedCount > 0) {
                console.log(`Cleaned up ${cleanedCount} expired/corrupted localStorage items`);
            }
        } catch (error) {
            console.error('Failed to cleanup localStorage:', error);
        }
    }

    /**
     * Format bytes to human readable string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Memory storage fallback methods (for when localStorage is not available)
    setMemoryItem(key, value) {
        if (!this.memoryStorage) {
            this.memoryStorage = {};
        }
        this.memoryStorage[key] = value;
        return true;
    }

    getMemoryItem(key, defaultValue = null) {
        if (!this.memoryStorage || !(key in this.memoryStorage)) {
            return defaultValue;
        }
        return this.memoryStorage[key];
    }

    removeMemoryItem(key) {
        if (this.memoryStorage && key in this.memoryStorage) {
            delete this.memoryStorage[key];
        }
        return true;
    }

    hasMemoryItem(key) {
        return this.memoryStorage && key in this.memoryStorage;
    }
}

/**
 * App-specific storage methods
 */
class PersonalitySparkStorage extends StorageManager {
    constructor() {
        super();
    }

    /**
     * Save quiz result
     */
    saveQuizResult(result) {
        const results = this.getQuizResults();
        results.push({
            ...result,
            id: window.PSHelpers?.generateUUID() || Date.now().toString(),
            savedAt: new Date().toISOString()
        });

        // Keep only last 50 results
        if (results.length > 50) {
            results.splice(0, results.length - 50);
        }

        return this.setItem('quiz-results', results);
    }

    /**
     * Get all quiz results
     */
    getQuizResults() {
        return this.getItem('quiz-results', []);
    }

    /**
     * Get latest quiz result
     */
    getLatestQuizResult() {
        const results = this.getQuizResults();
        return results.length > 0 ? results[results.length - 1] : null;
    }

    /**
     * Delete quiz result by ID
     */
    deleteQuizResult(resultId) {
        const results = this.getQuizResults();
        const filteredResults = results.filter(result => result.id !== resultId);
        return this.setItem('quiz-results', filteredResults);
    }

    /**
     * Save user preferences
     */
    saveUserPreferences(preferences) {
        const current = this.getUserPreferences();
        const updated = { ...current, ...preferences };
        return this.setItem('user-preferences', updated);
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        return this.getItem('user-preferences', {
            theme: 'light',
            language: 'en',
            notifications: true,
            shareResults: true,
            analyticsOptIn: true
        });
    }

    /**
     * Save app state
     */
    saveAppState(state) {
        return this.setItem('app-state', state);
    }

    /**
     * Get app state
     */
    getAppState() {
        return this.getItem('app-state', {
            currentPage: 'home',
            hasCompletedOnboarding: false,
            lastVisit: null,
            totalQuizzesTaken: 0
        });
    }

    /**
     * Track quiz completion
     */
    trackQuizCompletion(quizType) {
        const stats = this.getQuizStats();
        
        if (!stats[quizType]) {
            stats[quizType] = {
                count: 0,
                lastCompleted: null,
                averageScore: 0,
                totalScore: 0
            };
        }

        stats[quizType].count++;
        stats[quizType].lastCompleted = new Date().toISOString();

        // Update global stats
        stats.global = stats.global || {
            totalQuizzes: 0,
            firstQuizDate: null,
            lastQuizDate: null
        };

        stats.global.totalQuizzes++;
        stats.global.lastQuizDate = new Date().toISOString();
        
        if (!stats.global.firstQuizDate) {
            stats.global.firstQuizDate = new Date().toISOString();
        }

        return this.setItem('quiz-stats', stats);
    }

    /**
     * Get quiz statistics
     */
    getQuizStats() {
        return this.getItem('quiz-stats', {
            global: {
                totalQuizzes: 0,
                firstQuizDate: null,
                lastQuizDate: null
            }
        });
    }

    /**
     * Save analytics data (when offline)
     */
    saveAnalyticsEvent(event) {
        const events = this.getAnalyticsEvents();
        events.push({
            ...event,
            timestamp: Date.now(),
            synced: false
        });

        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }

        return this.setItem('analytics-events', events);
    }

    /**
     * Get unsynced analytics events
     */
    getAnalyticsEvents() {
        return this.getItem('analytics-events', []);
    }

    /**
     * Mark analytics events as synced
     */
    markAnalyticsEventsSynced() {
        const events = this.getAnalyticsEvents();
        const updatedEvents = events.map(event => ({ ...event, synced: true }));
        return this.setItem('analytics-events', updatedEvents);
    }

    /**
     * Clear synced analytics events
     */
    clearSyncedAnalyticsEvents() {
        const events = this.getAnalyticsEvents();
        const unsyncedEvents = events.filter(event => !event.synced);
        return this.setItem('analytics-events', unsyncedEvents);
    }

    /**
     * Save cached quiz data
     */
    saveCachedQuiz(quizType, quizData) {
        const cacheKey = `cached-quiz-${quizType}`;
        const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
        return this.setItem(cacheKey, quizData, {
            expires: Date.now() + expiresIn
        });
    }

    /**
     * Get cached quiz data
     */
    getCachedQuiz(quizType) {
        const cacheKey = `cached-quiz-${quizType}`;
        return this.getItem(cacheKey, null);
    }

    /**
     * Export all user data
     */
    exportUserData() {
        const data = {
            version: this.version,
            exportDate: new Date().toISOString(),
            quizResults: this.getQuizResults(),
            userPreferences: this.getUserPreferences(),
            appState: this.getAppState(),
            quizStats: this.getQuizStats()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import user data
     */
    importUserData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.quizResults) {
                this.setItem('quiz-results', data.quizResults);
            }

            if (data.userPreferences) {
                this.setItem('user-preferences', data.userPreferences);
            }

            if (data.appState) {
                this.setItem('app-state', data.appState);
            }

            if (data.quizStats) {
                this.setItem('quiz-stats', data.quizStats);
            }

            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            console.error('Failed to import user data:', error);
            return { success: false, message: 'Invalid data format' };
        }
    }

    /**
     * Get storage summary
     */
    getStorageSummary() {
        const storageInfo = this.getStorageInfo();
        const results = this.getQuizResults();
        const stats = this.getQuizStats();

        return {
            storageInfo: storageInfo,
            dataCount: {
                quizResults: results.length,
                totalQuizzes: stats.global?.totalQuizzes || 0,
                analyticsEvents: this.getAnalyticsEvents().length
            },
            lastActivity: {
                lastQuiz: stats.global?.lastQuizDate,
                lastSaved: results.length > 0 ? results[results.length - 1].savedAt : null
            }
        };
    }
}

// Create global instance
const storage = new PersonalitySparkStorage();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSStorage = storage;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, PersonalitySparkStorage };
}