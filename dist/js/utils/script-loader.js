/**
 * PersonalitySpark - Script Loader Utility
 * Dynamic script loading and management for analytics and tracking codes
 */

class ScriptLoader {
    constructor() {
        this.loadedScripts = new Set();
        this.loadingPromises = new Map();
        this.failedScripts = new Set();
        this.retryCount = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        console.log('🔧 ScriptLoader initialized');
    }

    /**
     * Load all enabled analytics scripts
     */
    async loadAnalyticsScripts() {
        if (!window.PSAnalyticsConfig) {
            console.error('📊 Analytics configuration not found');
            return;
        }

        const enabledScripts = window.PSAnalyticsConfig.getEnabledScripts();
        console.log(`📊 Loading ${enabledScripts.length} analytics scripts`);

        const loadPromises = enabledScripts.map(script => 
            this.loadScript(script.id, script)
        );

        try {
            await Promise.allSettled(loadPromises);
            console.log('📊 Analytics scripts loading completed');
        } catch (error) {
            console.error('📊 Error loading analytics scripts:', error);
        }
    }

    /**
     * Load a specific script
     */
    async loadScript(scriptId, config) {
        // Check if already loaded
        if (this.loadedScripts.has(scriptId)) {
            console.log(`🔧 Script already loaded: ${scriptId}`);
            return Promise.resolve();
        }

        // Check if currently loading
        if (this.loadingPromises.has(scriptId)) {
            return this.loadingPromises.get(scriptId);
        }

        // Create loading promise
        const loadPromise = this._loadScriptInternal(scriptId, config);
        this.loadingPromises.set(scriptId, loadPromise);

        try {
            await loadPromise;
            this.loadedScripts.add(scriptId);
            window.PSAnalyticsConfig?.markScriptLoaded(scriptId);
            console.log(`✅ Script loaded successfully: ${config.name || scriptId}`);
        } catch (error) {
            this.failedScripts.add(scriptId);
            console.error(`❌ Failed to load script: ${config.name || scriptId}`, error);
            throw error;
        } finally {
            this.loadingPromises.delete(scriptId);
        }
    }

    /**
     * Internal script loading logic
     */
    async _loadScriptInternal(scriptId, config) {
        switch (config.type) {
            case 'external':
                return this._loadExternalScript(scriptId, config);
            
            case 'inline':
                return this._executeInlineScript(scriptId, config);
            
            case 'internal':
                return this._loadInternalScript(scriptId, config);
            
            default:
                throw new Error(`Unknown script type: ${config.type}`);
        }
    }

    /**
     * Load external script from URL
     */
    async _loadExternalScript(scriptId, config) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            
            // Set script source
            script.src = config.src;
            
            // Set attributes
            Object.keys(config.attributes || {}).forEach(attr => {
                if (attr === 'async' || attr === 'defer') {
                    script[attr] = config.attributes[attr];
                } else {
                    script.setAttribute(attr, config.attributes[attr]);
                }
            });

            // Set loading event handlers
            script.onload = () => {
                console.log(`🔧 External script loaded: ${config.src}`);
                
                // Execute additional code if provided
                if (config.code) {
                    this._executeCode(config.code, scriptId);
                }
                
                resolve();
            };

            script.onerror = (error) => {
                console.error(`🔧 Failed to load external script: ${config.src}`, error);
                reject(new Error(`Failed to load script: ${config.src}`));
            };

            // Add to DOM
            const target = document.head || document.getElementsByTagName('head')[0];
            target.appendChild(script);

            console.log(`🔧 Loading external script: ${config.src}`);
        });
    }

    /**
     * Execute inline script code
     */
    async _executeInlineScript(scriptId, config) {
        return new Promise((resolve, reject) => {
            try {
                if (!config.code) {
                    reject(new Error('No code provided for inline script'));
                    return;
                }

                // Create script element for inline code
                const script = document.createElement('script');
                script.type = 'text/javascript';
                
                // Set attributes
                Object.keys(config.attributes || {}).forEach(attr => {
                    script.setAttribute(attr, config.attributes[attr]);
                });

                // Set script content
                script.textContent = config.code;

                // Add to DOM
                const target = document.head || document.getElementsByTagName('head')[0];
                target.appendChild(script);

                console.log(`🔧 Inline script executed: ${config.name || scriptId}`);
                resolve();

            } catch (error) {
                console.error(`🔧 Failed to execute inline script: ${config.name || scriptId}`, error);
                reject(error);
            }
        });
    }

    /**
     * Load internal script (already loaded modules)
     */
    async _loadInternalScript(scriptId, config) {
        // Internal scripts are already loaded as part of the application
        // Just mark as loaded
        console.log(`🔧 Internal script registered: ${config.name || scriptId}`);
        return Promise.resolve();
    }

    /**
     * Execute JavaScript code safely
     */
    _executeCode(code, scriptId) {
        try {
            // Use Function constructor for safer eval
            const func = new Function(code);
            func();
            console.log(`🔧 Additional code executed for: ${scriptId}`);
        } catch (error) {
            console.error(`🔧 Failed to execute additional code for: ${scriptId}`, error);
        }
    }

    /**
     * Load script with retry logic
     */
    async loadScriptWithRetry(scriptId, config) {
        const currentRetry = this.retryCount.get(scriptId) || 0;
        
        try {
            await this.loadScript(scriptId, config);
        } catch (error) {
            if (currentRetry < this.maxRetries) {
                this.retryCount.set(scriptId, currentRetry + 1);
                console.log(`🔧 Retrying script load (${currentRetry + 1}/${this.maxRetries}): ${scriptId}`);
                
                // Wait before retrying
                await this._delay(this.retryDelay * (currentRetry + 1));
                
                return this.loadScriptWithRetry(scriptId, config);
            } else {
                console.error(`🔧 Max retries reached for script: ${scriptId}`);
                throw error;
            }
        }
    }

    /**
     * Unload/remove a script
     */
    unloadScript(scriptId) {
        const scripts = document.querySelectorAll(`script[data-script-id="${scriptId}"]`);
        scripts.forEach(script => {
            script.remove();
        });

        this.loadedScripts.delete(scriptId);
        this.failedScripts.delete(scriptId);
        this.retryCount.delete(scriptId);
        
        console.log(`🔧 Script unloaded: ${scriptId}`);
    }

    /**
     * Check if script is loaded
     */
    isScriptLoaded(scriptId) {
        return this.loadedScripts.has(scriptId);
    }

    /**
     * Get loading status
     */
    getLoadingStatus() {
        return {
            loaded: Array.from(this.loadedScripts),
            loading: Array.from(this.loadingPromises.keys()),
            failed: Array.from(this.failedScripts),
            retryCount: Object.fromEntries(this.retryCount)
        };
    }

    /**
     * Load scripts conditionally
     */
    async loadConditionalScripts(condition) {
        if (!window.PSAnalyticsConfig) return;

        const allScripts = window.PSAnalyticsConfig.getAllScripts();
        const conditionalScripts = allScripts.filter(script => {
            if (typeof condition === 'function') {
                return condition(script);
            }
            return script.conditions && script.conditions[condition];
        });

        const loadPromises = conditionalScripts.map(script => 
            this.loadScript(script.id, script)
        );

        await Promise.allSettled(loadPromises);
    }

    /**
     * Load scripts after user consent
     */
    async loadConsentScripts() {
        console.log('🔧 Loading consent-required scripts');
        await this.loadConditionalScripts(script => script.conditions?.consent);
    }

    /**
     * Load production-only scripts
     */
    async loadProductionScripts() {
        console.log('🔧 Loading production scripts');
        await this.loadConditionalScripts(script => script.conditions?.production);
    }

    /**
     * Preload script (download but don't execute)
     */
    preloadScript(src) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = src;
            
            link.onload = resolve;
            link.onerror = reject;
            
            document.head.appendChild(link);
        });
    }

    /**
     * Clear all loaded scripts
     */
    clearAllScripts() {
        // Remove all analytics-related scripts
        const scripts = document.querySelectorAll('script[data-script-id]');
        scripts.forEach(script => script.remove());

        // Clear internal state
        this.loadedScripts.clear();
        this.loadingPromises.clear();
        this.failedScripts.clear();
        this.retryCount.clear();

        console.log('🔧 All scripts cleared');
    }

    /**
     * Reload all scripts
     */
    async reloadAllScripts() {
        this.clearAllScripts();
        await this.loadAnalyticsScripts();
    }

    /**
     * Utility function to delay execution
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create script element with proper attributes
     */
    _createScriptElement(config) {
        const script = document.createElement('script');
        
        // Set data attribute for identification
        if (config.id) {
            script.setAttribute('data-script-id', config.id);
        }

        // Set type
        script.type = 'text/javascript';

        return script;
    }

    /**
     * Monitor script loading performance
     */
    _trackLoadingPerformance(scriptId, startTime) {
        const loadTime = Date.now() - startTime;
        
        if (window.PSAnalytics) {
            window.PSAnalytics.trackPerformance('script_load_time', loadTime, {
                scriptId: scriptId
            });
        }

        console.log(`⏱️ Script ${scriptId} loaded in ${loadTime}ms`);
    }
}

// Create global instance
const scriptLoader = new ScriptLoader();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSScriptLoader = scriptLoader;
}

// Auto-load analytics scripts when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        scriptLoader.loadAnalyticsScripts();
    });
} else {
    // DOM is already ready
    setTimeout(() => scriptLoader.loadAnalyticsScripts(), 0);
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptLoader;
}