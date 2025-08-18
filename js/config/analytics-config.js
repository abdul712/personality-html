/**
 * PersonalitySpark - Analytics Configuration
 * Centralized configuration for all tracking codes and analytics services
 */

class AnalyticsConfig {
    constructor() {
        this.scripts = new Map();
        this.isInitialized = false;
        this.loadedScripts = new Set();
        this.initializeScripts();
    }

    /**
     * Initialize all analytics script configurations
     */
    initializeScripts() {
        // Grow.me Ad Monetization Script
        this.scripts.set('growme', {
            id: 'growme',
            name: 'Grow.me Ad Network',
            description: 'Monetization script that displays ads across the website',
            enabled: true,
            priority: 1,
            type: 'inline',
            category: 'monetization',
            code: `!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpjZDExNDdjMS0zZWEyLTRkZWEtYjY4NS02NjBiOTBlODk2MmU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`,
            attributes: {
                'data-grow-initializer': ''
            },
            conditions: {
                consent: false, // Ad scripts typically don't require explicit consent for basic functionality
                production: true, // Only load in production
                cookiesEnabled: false // Basic ad functionality doesn't require cookies
            },
            features: [
                'Automatic ad placement',
                'Revenue optimization',
                'Non-intrusive ad formats',
                'Mobile-friendly ads'
            ]
        });

        // Google Analytics 4 (GA4) - Property ID: 426722856
        this.scripts.set('ga4', {
            id: 'ga4',
            name: 'Google Analytics 4',
            enabled: true, // ✅ ENABLED with Measurement ID G-HF94KPRD1H
            priority: 2,
            type: 'external',
            src: 'https://www.googletagmanager.com/gtag/js?id=G-HF94KPRD1H',
            code: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-HF94KPRD1H', {
    anonymize_ip: true,
    cookie_flags: 'secure;samesite=strict'
});`,
            attributes: {
                async: true
            },
            conditions: {
                consent: true,
                production: true,
                cookiesEnabled: true
            },
            configured: true
        });

        // Google AdSense
        this.scripts.set('adsense', {
            id: 'adsense',
            name: 'Google AdSense',
            enabled: false,
            priority: 3,
            type: 'external',
            src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX',
            attributes: {
                async: true,
                crossorigin: 'anonymous',
                'data-ad-client': 'ca-pub-XXXXXXXXXXXXXXXX'
            },
            conditions: {
                consent: false,
                production: true,
                cookiesEnabled: false
            },
            placeholder: 'ca-pub-XXXXXXXXXXXXXXXX'
        });

        // Facebook Pixel
        this.scripts.set('facebook', {
            id: 'facebook',
            name: 'Facebook Pixel',
            enabled: false,
            priority: 4,
            type: 'inline',
            code: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'FACEBOOK_PIXEL_ID');
fbq('track', 'PageView');`,
            attributes: {},
            conditions: {
                consent: true,
                production: true,
                cookiesEnabled: true
            },
            placeholder: 'FACEBOOK_PIXEL_ID'
        });

        // Microsoft Clarity
        this.scripts.set('clarity', {
            id: 'clarity',
            name: 'Microsoft Clarity',
            enabled: false,
            priority: 5,
            type: 'inline',
            code: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "CLARITY_PROJECT_ID");`,
            attributes: {},
            conditions: {
                consent: true,
                production: true,
                cookiesEnabled: false
            },
            placeholder: 'CLARITY_PROJECT_ID'
        });

        // Hotjar
        this.scripts.set('hotjar', {
            id: 'hotjar',
            name: 'Hotjar',
            enabled: false,
            priority: 6,
            type: 'inline',
            code: `(function(h,o,t,j,a,r){
h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
h._hjSettings={hjid:HOTJAR_ID,hjsv:6};
a=o.getElementsByTagName('head')[0];
r=o.createElement('script');r.async=1;
r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
            attributes: {},
            conditions: {
                consent: true,
                production: true,
                cookiesEnabled: true
            },
            placeholder: 'HOTJAR_ID'
        });

        // Custom Analytics (Internal)
        this.scripts.set('internal', {
            id: 'internal',
            name: 'Internal Analytics',
            enabled: true,
            priority: 0,
            type: 'internal',
            code: null, // Uses existing analytics.js
            attributes: {},
            conditions: {
                consent: false,
                production: false,
                cookiesEnabled: false
            }
        });

        this.isInitialized = true;
        console.log('📊 Analytics configuration initialized with', this.scripts.size, 'scripts');
    }

    /**
     * Get all scripts configuration
     */
    getAllScripts() {
        return Array.from(this.scripts.values());
    }

    /**
     * Get enabled scripts based on conditions
     */
    getEnabledScripts() {
        const environment = this.getEnvironment();
        const hasConsent = this.hasUserConsent();
        const cookiesEnabled = this.areCookiesEnabled();

        return Array.from(this.scripts.values())
            .filter(script => {
                if (!script.enabled) return false;

                // Check environment condition
                if (script.conditions.production && !environment.isProduction) {
                    return false;
                }

                // Check consent condition
                if (script.conditions.consent && !hasConsent) {
                    return false;
                }

                // Check cookies condition
                if (script.conditions.cookiesEnabled && !cookiesEnabled) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get specific script configuration
     */
    getScript(scriptId) {
        return this.scripts.get(scriptId);
    }

    /**
     * Enable/disable a specific script
     */
    setScriptEnabled(scriptId, enabled) {
        const script = this.scripts.get(scriptId);
        if (script) {
            script.enabled = enabled;
            console.log(`📊 ${script.name} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Update script configuration
     */
    updateScript(scriptId, config) {
        const script = this.scripts.get(scriptId);
        if (script) {
            Object.assign(script, config);
            console.log(`📊 ${script.name} configuration updated`);
        }
    }

    /**
     * Add new script configuration
     */
    addScript(scriptId, config) {
        const defaultConfig = {
            id: scriptId,
            enabled: false,
            priority: 10,
            type: 'external',
            attributes: {},
            conditions: {
                consent: false,
                production: true,
                cookiesEnabled: false
            }
        };

        this.scripts.set(scriptId, { ...defaultConfig, ...config });
        console.log(`📊 New script added: ${config.name || scriptId}`);
    }

    /**
     * Remove script configuration
     */
    removeScript(scriptId) {
        const script = this.scripts.get(scriptId);
        if (script) {
            this.scripts.delete(scriptId);
            console.log(`📊 Script removed: ${script.name}`);
        }
    }

    /**
     * Configure script with actual IDs/tokens
     */
    configureScript(scriptId, values) {
        const script = this.scripts.get(scriptId);
        if (!script) {
            console.warn(`📊 Script not found: ${scriptId}`);
            return false;
        }

        // Replace placeholders in script code and src
        if (script.code && script.placeholder) {
            script.code = script.code.replace(
                new RegExp(script.placeholder, 'g'), 
                values.id || values[script.placeholder] || ''
            );
        }

        if (script.src && script.placeholder) {
            script.src = script.src.replace(
                new RegExp(script.placeholder, 'g'), 
                values.id || values[script.placeholder] || ''
            );
        }

        // Update attributes with actual values
        if (script.attributes) {
            Object.keys(script.attributes).forEach(attr => {
                if (typeof script.attributes[attr] === 'string' && script.placeholder) {
                    script.attributes[attr] = script.attributes[attr].replace(
                        new RegExp(script.placeholder, 'g'), 
                        values.id || values[script.placeholder] || ''
                    );
                }
            });
        }

        // Enable the script after configuration
        script.enabled = true;
        script.configured = true;

        console.log(`📊 ${script.name} configured and enabled`);
        return true;
    }

    /**
     * Check environment
     */
    getEnvironment() {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local');
        const isStaging = hostname.includes('staging') || hostname.includes('dev');
        const isProduction = !isLocalhost && !isStaging;

        return {
            hostname,
            isLocalhost,
            isStaging,
            isProduction
        };
    }

    /**
     * Check if user has given consent
     */
    hasUserConsent() {
        if (window.PSStorage) {
            const preferences = window.PSStorage.getUserPreferences();
            return preferences?.analyticsOptIn !== false; // Default to true
        }
        return true; // Default consent for basic functionality
    }

    /**
     * Check if cookies are enabled
     */
    areCookiesEnabled() {
        try {
            document.cookie = 'test=1; SameSite=Strict; Secure';
            const enabled = document.cookie.includes('test=1');
            document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
            return enabled;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get configuration summary
     */
    getSummary() {
        const enabled = this.getEnabledScripts();
        const environment = this.getEnvironment();
        
        return {
            totalScripts: this.scripts.size,
            enabledScripts: enabled.length,
            environment: environment,
            hasConsent: this.hasUserConsent(),
            cookiesEnabled: this.areCookiesEnabled(),
            loadedScripts: Array.from(this.loadedScripts),
            scripts: this.getAllScripts().map(script => ({
                id: script.id,
                name: script.name,
                enabled: script.enabled,
                type: script.type,
                priority: script.priority,
                configured: script.configured || false
            }))
        };
    }

    /**
     * Mark script as loaded
     */
    markScriptLoaded(scriptId) {
        this.loadedScripts.add(scriptId);
        console.log(`📊 Script loaded: ${scriptId}`);
    }

    /**
     * Check if script is loaded
     */
    isScriptLoaded(scriptId) {
        return this.loadedScripts.has(scriptId);
    }
}

// Create global instance
const analyticsConfig = new AnalyticsConfig();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSAnalyticsConfig = analyticsConfig;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsConfig;
}