/**
 * PersonalitySpark - Analytics & Monetization Setup
 * Easy configuration for analytics tracking and ad monetization services
 */

(function() {
    'use strict';

    // Configuration object for all tracking and monetization services
    const TRACKING_CONFIG = {
        // Grow.me Ad Network - Monetization script for displaying ads
        growme: {
            enabled: true,
            type: 'monetization',
            siteId: 'U2l0ZTpjZDExNDdjMS0zZWEyLTRkZWEtYjY4NS02NjBiOTBlODk2MmU=',
            description: 'Displays ads across the website for revenue generation'
        },

        // Google Analytics 4 - Property ID: 426722856
        googleAnalytics: {
            enabled: true, // ✅ ACTIVE - Measurement ID configured
            trackingId: 'G-HF94KPRD1H', // ✅ Your GA4 Measurement ID
            propertyId: '426722856', // Your property ID for reference
            config: {
                anonymize_ip: true,
                cookie_flags: 'secure;samesite=strict',
                send_page_view: true
            }
        },

        // Google AdSense - Add your client ID here
        googleAdsense: {
            enabled: false,
            clientId: 'ca-pub-XXXXXXXXXXXXXXXX' // Replace with your AdSense client ID
        },

        // Facebook Pixel - Add your pixel ID here
        facebookPixel: {
            enabled: false,
            pixelId: 'YOUR_FACEBOOK_PIXEL_ID'
        },

        // Microsoft Clarity - Add your project ID here
        microsoftClarity: {
            enabled: false,
            projectId: 'YOUR_CLARITY_PROJECT_ID'
        },

        // Hotjar - Add your site ID here
        hotjar: {
            enabled: false,
            siteId: 'YOUR_HOTJAR_SITE_ID'
        }
    };

    /**
     * Initialize tracking services when DOM is ready
     */
    function initializeTracking() {
        console.log('🚀 Initializing tracking services...');

        // Wait for analytics config to be available
        if (typeof window.PSAnalyticsConfig === 'undefined') {
            setTimeout(initializeTracking, 100);
            return;
        }

        // Configure Google Analytics if enabled
        if (TRACKING_CONFIG.googleAnalytics.enabled && TRACKING_CONFIG.googleAnalytics.trackingId !== 'G-XXXXXXXXXX') {
            window.PSAnalyticsConfig.configureScript('ga4', {
                id: TRACKING_CONFIG.googleAnalytics.trackingId
            });
            console.log('✅ Google Analytics 4 configured');
        }

        // Configure Google AdSense if enabled
        if (TRACKING_CONFIG.googleAdsense.enabled && TRACKING_CONFIG.googleAdsense.clientId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
            window.PSAnalyticsConfig.configureScript('adsense', {
                id: TRACKING_CONFIG.googleAdsense.clientId
            });
            console.log('✅ Google AdSense configured');
        }

        // Configure Facebook Pixel if enabled
        if (TRACKING_CONFIG.facebookPixel.enabled && TRACKING_CONFIG.facebookPixel.pixelId !== 'YOUR_FACEBOOK_PIXEL_ID') {
            window.PSAnalyticsConfig.configureScript('facebook', {
                id: TRACKING_CONFIG.facebookPixel.pixelId
            });
            console.log('✅ Facebook Pixel configured');
        }

        // Configure Microsoft Clarity if enabled
        if (TRACKING_CONFIG.microsoftClarity.enabled && TRACKING_CONFIG.microsoftClarity.projectId !== 'YOUR_CLARITY_PROJECT_ID') {
            window.PSAnalyticsConfig.configureScript('clarity', {
                id: TRACKING_CONFIG.microsoftClarity.projectId
            });
            console.log('✅ Microsoft Clarity configured');
        }

        // Configure Hotjar if enabled
        if (TRACKING_CONFIG.hotjar.enabled && TRACKING_CONFIG.hotjar.siteId !== 'YOUR_HOTJAR_SITE_ID') {
            window.PSAnalyticsConfig.configureScript('hotjar', {
                id: TRACKING_CONFIG.hotjar.siteId
            });
            console.log('✅ Hotjar configured');
        }

        // Grow.me Ad Network is already configured by default in analytics-config.js
        console.log('✅ Grow.me Ad Network enabled for website monetization');

        // Log configuration summary
        setTimeout(() => {
            if (window.PSAnalyticsConfig) {
                console.log('📊 Analytics Configuration Summary:', window.PSAnalyticsConfig.getSummary());
            }
        }, 1000);
    }

    /**
     * Add utility functions to window for easy configuration
     */
    window.PersonalitySparkTracking = {
        /**
         * Enable Google Analytics with tracking ID
         * Property ID: 426722856 - You need the Measurement ID that starts with 'G-'
         */
        enableGoogleAnalytics: function(measurementId, config = {}) {
            if (!measurementId) {
                console.error('❌ Google Analytics Measurement ID required (format: G-XXXXXXXXXX)');
                console.log('📍 Find your Measurement ID in GA4: Admin > Property > Data Streams > Web Stream Details');
                console.log('🆔 Your Property ID is: 426722856');
                return false;
            }

            if (!measurementId.startsWith('G-')) {
                console.error('❌ Invalid format. Measurement ID must start with "G-" (example: G-ABC123DEF4)');
                console.log('📍 Find your Measurement ID in GA4: Admin > Property > Data Streams > Web Stream Details');
                return false;
            }

            TRACKING_CONFIG.googleAnalytics.enabled = true;
            TRACKING_CONFIG.googleAnalytics.trackingId = measurementId;
            TRACKING_CONFIG.googleAnalytics.config = { ...TRACKING_CONFIG.googleAnalytics.config, ...config };

            if (window.PSAnalyticsConfig) {
                window.PSAnalyticsConfig.configureScript('ga4', { id: measurementId });
                console.log('✅ Google Analytics enabled for Property ID 426722856');
                console.log('📊 Measurement ID:', measurementId);
                return true;
            }

            console.log('⏳ Google Analytics will be enabled when config loads');
            return true;
        },

        /**
         * Enable Google AdSense with client ID
         */
        enableGoogleAdsense: function(clientId) {
            if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') {
                console.error('❌ Valid Google AdSense client ID required');
                return false;
            }

            TRACKING_CONFIG.googleAdsense.enabled = true;
            TRACKING_CONFIG.googleAdsense.clientId = clientId;

            if (window.PSAnalyticsConfig) {
                window.PSAnalyticsConfig.configureScript('adsense', { id: clientId });
                console.log('✅ Google AdSense enabled:', clientId);
                return true;
            }

            console.log('⏳ Google AdSense will be enabled when config loads');
            return true;
        },

        /**
         * Enable Facebook Pixel with pixel ID
         */
        enableFacebookPixel: function(pixelId) {
            if (!pixelId || pixelId === 'YOUR_FACEBOOK_PIXEL_ID') {
                console.error('❌ Valid Facebook Pixel ID required');
                return false;
            }

            TRACKING_CONFIG.facebookPixel.enabled = true;
            TRACKING_CONFIG.facebookPixel.pixelId = pixelId;

            if (window.PSAnalyticsConfig) {
                window.PSAnalyticsConfig.configureScript('facebook', { id: pixelId });
                console.log('✅ Facebook Pixel enabled:', pixelId);
                return true;
            }

            console.log('⏳ Facebook Pixel will be enabled when config loads');
            return true;
        },

        /**
         * Enable Microsoft Clarity with project ID
         */
        enableMicrosoftClarity: function(projectId) {
            if (!projectId || projectId === 'YOUR_CLARITY_PROJECT_ID') {
                console.error('❌ Valid Microsoft Clarity project ID required');
                return false;
            }

            TRACKING_CONFIG.microsoftClarity.enabled = true;
            TRACKING_CONFIG.microsoftClarity.projectId = projectId;

            if (window.PSAnalyticsConfig) {
                window.PSAnalyticsConfig.configureScript('clarity', { id: projectId });
                console.log('✅ Microsoft Clarity enabled:', projectId);
                return true;
            }

            console.log('⏳ Microsoft Clarity will be enabled when config loads');
            return true;
        },

        /**
         * Enable Hotjar with site ID
         */
        enableHotjar: function(siteId) {
            if (!siteId || siteId === 'YOUR_HOTJAR_SITE_ID') {
                console.error('❌ Valid Hotjar site ID required');
                return false;
            }

            TRACKING_CONFIG.hotjar.enabled = true;
            TRACKING_CONFIG.hotjar.siteId = siteId;

            if (window.PSAnalyticsConfig) {
                window.PSAnalyticsConfig.configureScript('hotjar', { id: siteId });
                console.log('✅ Hotjar enabled:', siteId);
                return true;
            }

            console.log('⏳ Hotjar will be enabled when config loads');
            return true;
        },

        /**
         * Get current configuration
         */
        getConfig: function() {
            return TRACKING_CONFIG;
        },

        /**
         * Get analytics summary
         */
        getSummary: function() {
            if (window.PSAnalyticsConfig) {
                return window.PSAnalyticsConfig.getSummary();
            }
            return { error: 'Analytics config not loaded yet' };
        },

        /**
         * Disable a specific tracking service
         */
        disableService: function(serviceName) {
            if (TRACKING_CONFIG[serviceName]) {
                TRACKING_CONFIG[serviceName].enabled = false;
                
                if (window.PSAnalyticsConfig) {
                    const scriptMap = {
                        googleAnalytics: 'ga4',
                        googleAdsense: 'adsense',
                        facebookPixel: 'facebook',
                        microsoftClarity: 'clarity',
                        hotjar: 'hotjar',
                        growme: 'growme'
                    };
                    
                    const scriptId = scriptMap[serviceName];
                    if (scriptId) {
                        window.PSAnalyticsConfig.setScriptEnabled(scriptId, false);
                    }
                }
                
                console.log(`❌ ${serviceName} disabled`);
                return true;
            }
            
            console.error(`❌ Service not found: ${serviceName}`);
            return false;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTracking);
    } else {
        initializeTracking();
    }

    console.log('📊 Tracking setup loaded - use window.PersonalitySparkTracking for configuration');
})();